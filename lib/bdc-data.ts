import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

export interface BDCItem {
  id: string;
  cliente: string;
  vendedor: string;
  cidade: string;
  modelo: string;
  chassi: string;
  dataFaturamento: string;
  dataChegada: string;
  situacao: string;
}

export const bdcItems: BDCItem[] = [
  {
    id: "1",
    cliente: "João Silva",
    vendedor: "Carlos Mendes",
    cidade: "São Paulo",
    modelo: "Honda Civic EXL",
    chassi: "9BWHE21JX24060961",
    dataFaturamento: "10/03/2025",
    dataChegada: "15/03/2025",
    situacao: "Pendente",
  },
  {
    id: "2",
    cliente: "Maria Oliveira",
    vendedor: "Ana Paula Costa",
    cidade: "Rio de Janeiro",
    modelo: "Toyota Corolla XEI",
    chassi: "3VWFE21C4YM543210",
    dataFaturamento: "05/03/2025",
    dataChegada: "18/03/2025",
    situacao: "Em Emplacamento",
  },
  {
    id: "3",
    cliente: "Pedro Santos",
    vendedor: "Carlos Mendes",
    cidade: "Belo Horizonte",
    modelo: "Jeep Compass Limited",
    chassi: "1FTFW1EF7EKG12345",
    dataFaturamento: "01/03/2025",
    dataChegada: "20/03/2025",
    situacao: "Emplacado",
  },
  {
    id: "4",
    cliente: "Fernanda Lima",
    vendedor: "Roberto Almeida",
    cidade: "Curitiba",
    modelo: "Hyundai Creta Platinum",
    chassi: "5NPEB4AC8BH123456",
    dataFaturamento: "08/03/2025",
    dataChegada: "22/03/2025",
    situacao: "Pendente",
  },
  {
    id: "5",
    cliente: "Lucas Pereira",
    vendedor: "Ana Paula Costa",
    cidade: "Porto Alegre",
    modelo: "Volkswagen T-Cross Highline",
    chassi: "WVGZZZ5NZAW123456",
    dataFaturamento: "02/03/2025",
    dataChegada: "25/03/2025",
    situacao: "Pendente",
  },
  {
    id: "6",
    cliente: "Camila Rodrigues",
    vendedor: "Roberto Almeida",
    cidade: "Salvador",
    modelo: "Chevrolet Tracker Premier",
    chassi: "3GNDA13D76S123456",
    dataFaturamento: "12/03/2025",
    dataChegada: "28/03/2025",
    situacao: "Pendente",
  },
  {
    id: "7",
    cliente: "Rafael Souza",
    vendedor: "Carlos Mendes",
    cidade: "São Paulo",
    modelo: "BMW 320i Sport",
    chassi: "WBA3B1C51DF123456",
    dataFaturamento: "15/03/2025",
    dataChegada: "01/04/2025",
    situacao: "Em Emplacamento",
  },
  {
    id: "8",
    cliente: "Juliana Martins",
    vendedor: "Ana Paula Costa",
    cidade: "Campinas",
    modelo: "Mercedes-Benz A200",
    chassi: "WDD1770431J123456",
    dataFaturamento: "18/03/2025",
    dataChegada: "05/04/2025",
    situacao: "Pendente",
  },
  {
    id: "9",
    cliente: "Marcos Duarte",
    vendedor: "Roberto Almeida",
    cidade: "Brasília",
    modelo: "Ford Bronco Wildtrak",
    chassi: "1FMCU0F60LUA12345",
    dataFaturamento: "20/03/2025",
    dataChegada: "08/04/2025",
    situacao: "Emplacado",
  },
  {
    id: "10",
    cliente: "Patrícia Gomes",
    vendedor: "Carlos Mendes",
    cidade: "Florianópolis",
    modelo: "BYD Dolphin Plus",
    chassi: "LGXCG4DG9N1234567",
    dataFaturamento: "22/03/2025",
    dataChegada: "10/04/2025",
    situacao: "Pendente",
  },
];

export function getStatusChegada(dataChegada: string) {
  const hoje = dayjs().startOf("day");
  const chegada = dayjs(dataChegada, "DD/MM/YYYY").startOf("day");

  if (chegada.isBefore(hoje) || chegada.isSame(hoje, "day")) {
    return {
      label: "Chegou",
      color:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    };
  }

  return {
    label: "Não Chegou",
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };
}
