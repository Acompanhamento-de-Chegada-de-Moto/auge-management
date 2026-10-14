"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, QrCode } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { getArrivalStatus } from "@/lib/bdc-data";
import {
  type CheckInMotorcycle,
  chassisSchema,
  pinLoginSchema,
  qrChassisSchema,
} from "@/lib/check-in/schemas";
import { formatDateBR } from "@/lib/utils";
import {
  confirmArrivalAction,
  loginCheckInAction,
  logoutCheckInAction,
  lookupMotorcycleAction,
} from "../_actions/check-in";
import { QrScanner } from "./QrScanner";

export function CheckInConsole({
  operator,
}: {
  operator: {
    name: string;
    expiresAt: string;
    kind: "operator" | "staff";
  } | null;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [camera, setCamera] = useState(true);
  const [inputMode, setInputMode] = useState<"qr" | "manual">("qr");
  const [busy, setBusy] = useState(false);
  const [motorcycle, setMotorcycle] = useState<CheckInMotorcycle | null>(null);
  const [source, setSource] = useState<"MANUAL" | "QR_CODE">("MANUAL");
  const [confirmed, setConfirmed] = useState(false);
  const login = useForm<z.infer<typeof pinLoginSchema>>({
    resolver: zodResolver(pinLoginSchema),
    defaultValues: { identifier: "", pin: "" },
  });
  const chassis = useForm<z.infer<typeof chassisSchema>>({
    resolver: zodResolver(chassisSchema),
    defaultValues: { chassi: "" },
  });
  async function unlock(values: z.infer<typeof pinLoginSchema>) {
    setMessage("");
    try {
      const result = await loginCheckInAction(values);
      login.resetField("pin");
      if (result.ok) router.refresh();
      else setMessage(result.message);
    } catch {
      setMessage("Não foi possível entrar. Tente novamente.");
    }
  }
  const lookup = useCallback(
    async (chassi: string, method: "MANUAL" | "QR_CODE") => {
      setCamera(false);
      setBusy(true);
      setMessage("");
      setMotorcycle(null);
      setConfirmed(false);
      setSource(method);
      try {
        const parsed =
          method === "QR_CODE"
            ? qrChassisSchema.safeParse(chassi)
            : chassisSchema.safeParse({ chassi });
        if (!parsed.success) {
          setMessage(
            "QR/chassi inválido. Digite o chassi indicado na motocicleta.",
          );
          return;
        }
        const result = await lookupMotorcycleAction(parsed.data);
        if (result.ok && result.motorcycle) setMotorcycle(result.motorcycle);
        else setMessage(result.message);
      } catch {
        setMessage("Não foi possível consultar. Tente novamente.");
      } finally {
        setBusy(false);
      }
    },
    [],
  );
  const readQr = useCallback(
    (value: string) => {
      void lookup(value, "QR_CODE");
    },
    [lookup],
  );
  async function confirm() {
    if (!motorcycle) return;
    setBusy(true);
    setMessage("");
    try {
      const result = await confirmArrivalAction({
        motorcycleId: motorcycle.id,
        chassi: motorcycle.chassi,
        source,
      });
      if (result.ok && result.motorcycle) {
        setMotorcycle(result.motorcycle);
        setConfirmed(true);
      } else setMessage(result.message);
    } catch {
      setMessage(
        "Não foi possível confirmar. Consulte novamente antes de tentar outra vez.",
      );
    } finally {
      setBusy(false);
    }
  }
  if (!operator)
    return (
      <section className="rounded-xl border border-base-300 bg-base-100 p-6">
        <h2 className="font-semibold">Acesso do operador</h2>
        <p className="mt-2 text-sm text-base-content/65">
          Use seu nome e o PIN fornecido pelo administrador.
        </p>
        <Link
          href="/sign-in?next=/check-in"
          className="btn btn-outline mt-4 w-full"
        >
          Entrar com minha conta da plataforma
        </Link>
        <form className="mt-5 space-y-4" onSubmit={login.handleSubmit(unlock)}>
          <label className="block text-sm">
            Nome completo
            <input
              autoComplete="username"
              autoCapitalize="words"
              className="input mt-1 w-full"
              {...login.register("identifier")}
            />
            <span className="text-error">
              {login.formState.errors.identifier?.message}
            </span>
          </label>
          <label className="block text-sm">
            PIN de 8 dígitos
            <input
              type="password"
              inputMode="numeric"
              autoComplete="current-password"
              maxLength={8}
              className="input mt-1 w-full"
              {...login.register("pin")}
            />
            <span className="text-error">
              {login.formState.errors.pin?.message}
            </span>
          </label>
          {message && (
            <p role="alert" className="text-sm text-error">
              {message}
            </p>
          )}
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={login.formState.isSubmitting}
          >
            {login.formState.isSubmitting
              ? "Validando…"
              : "Liberar recebimento"}
          </button>
        </form>
      </section>
    );
  const received = motorcycle?.forecastArrivalStatus === "ARRIVED";
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 rounded-xl border border-base-300 bg-base-100 p-4">
        <div>
          <p className="text-sm font-semibold">{operator.name}</p>
          <p className="text-xs text-base-content/60">
            Acesso até{" "}
            {new Date(operator.expiresAt).toLocaleTimeString("pt-BR", {
              timeZone: "America/Sao_Paulo",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <button
          type="button"
          className="btn btn-sm btn-ghost"
          disabled={busy}
          onClick={async () => {
            setCamera(false);
            if (operator.kind === "staff") {
              router.push("/inventory");
              return;
            }
            await logoutCheckInAction();
            setMotorcycle(null);
            router.refresh();
          }}
        >
          {operator.kind === "staff" ? "Voltar à plataforma" : "Sair"}
        </button>
      </div>
      {!motorcycle && (
        <>
          <div
            className="tabs tabs-box"
            role="tablist"
            aria-label="Forma de consulta"
          >
            <button
              type="button"
              role="tab"
              id="qr-tab"
              aria-controls="qr-panel"
              aria-selected={inputMode === "qr"}
              className={`tab flex-1 gap-2 ${inputMode === "qr" ? "tab-active" : ""}`}
              disabled={busy}
              onClick={() => {
                setInputMode("qr");
                setCamera(true);
                setMessage("");
              }}
            >
              <QrCode className="size-4" />
              Ler QR code
            </button>
            <button
              type="button"
              role="tab"
              id="manual-tab"
              aria-controls="manual-panel"
              aria-selected={inputMode === "manual"}
              className={`tab flex-1 ${inputMode === "manual" ? "tab-active" : ""}`}
              disabled={busy}
              onClick={() => {
                setInputMode("manual");
                setCamera(false);
                setMessage("");
              }}
            >
              Digitar chassi
            </button>
          </div>
          {inputMode === "qr" && (
            <div id="qr-panel" role="tabpanel" aria-labelledby="qr-tab">
              {camera && !busy ? (
                <QrScanner onRead={readQr} onClose={() => setCamera(false)} />
              ) : (
                <button
                  type="button"
                  className="btn btn-primary min-h-14 w-full"
                  disabled={busy}
                  onClick={() => setCamera(true)}
                >
                  {busy ? "Consultando…" : "Abrir câmera novamente"}
                </button>
              )}
            </div>
          )}
          {inputMode === "manual" && (
            <div id="manual-panel" role="tabpanel" aria-labelledby="manual-tab">
              <form
                className="rounded-xl border border-base-300 bg-base-100 p-5"
                onSubmit={chassis.handleSubmit((values) =>
                  lookup(values.chassi, "MANUAL"),
                )}
              >
                <label className="text-sm font-medium">
                  Chassi
                  <input
                    autoCapitalize="characters"
                    autoComplete="off"
                    maxLength={17}
                    className="input mt-2 w-full font-mono uppercase"
                    {...chassis.register("chassi")}
                  />
                  <span className="text-sm text-error">
                    {chassis.formState.errors.chassi?.message}
                  </span>
                </label>
                <button
                  type="submit"
                  disabled={busy || camera}
                  className="btn btn-outline mt-3 w-full"
                >
                  {busy ? "Consultando…" : "Consultar motocicleta"}
                </button>
              </form>
            </div>
          )}
        </>
      )}
      {motorcycle && (
        <section className="space-y-4 rounded-xl border border-base-300 bg-base-100 p-6">
          {received && (
            <div
              aria-live="polite"
              className="flex items-center gap-2 text-success"
            >
              <CheckCircle2 className="size-5" />
              <h2 className="font-semibold">
                {confirmed ? "Chegada confirmada" : "Motocicleta já recebida"}
              </h2>
            </div>
          )}
          <div>
            <p className="text-xs text-base-content/60">Modelo</p>
            <p className="text-xl font-semibold">{motorcycle.model}</p>
          </div>
          <div>
            <p className="text-xs text-base-content/60">Chassi</p>
            <p className="break-all font-mono">{motorcycle.chassi}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-base-content/60">Previsão</p>
              <p>
                {formatDateBR(motorcycle.forecastArrival) ?? "Sem previsão"}
              </p>
            </div>
            <div>
              <p className="text-xs text-base-content/60">Situação</p>
              <p>
                {
                  getArrivalStatus(
                    motorcycle.forecastArrival
                      ? new Date(motorcycle.forecastArrival)
                      : null,
                    motorcycle.forecastArrivalStatus,
                  ).label
                }
              </p>
            </div>
          </div>
          {motorcycle.arrivedAt && (
            <p className="text-sm">
              Recebida em{" "}
              {new Date(motorcycle.arrivedAt).toLocaleString("pt-BR", {
                timeZone: "America/Sao_Paulo",
              })}
            </p>
          )}
          {!received && (
            <>
              <p className="text-sm text-base-content/65">
                Confirme somente se esta motocicleta está fisicamente presente.
              </p>
              <button
                type="button"
                disabled={busy}
                className="btn btn-primary min-h-14 w-full"
                onClick={confirm}
              >
                {busy ? "Confirmando…" : "Confirmar chegada"}
              </button>
            </>
          )}
          <button
            type="button"
            disabled={busy}
            className="btn btn-outline w-full"
            onClick={() => {
              setMotorcycle(null);
              setConfirmed(false);
              setMessage("");
              chassis.reset();
              setCamera(inputMode === "qr");
            }}
          >
            {received ? "Receber próxima moto" : "Voltar à consulta"}
          </button>
        </section>
      )}
      {message && (
        <p
          role="alert"
          className="rounded-lg border border-error/20 bg-error/5 p-4 text-sm text-error"
        >
          {message}
          <button
            className="link ml-2"
            type="button"
            onClick={() => router.refresh()}
          >
            Atualizar acesso
          </button>
        </p>
      )}
    </div>
  );
}
