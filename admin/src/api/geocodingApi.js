import axios from "axios";

const nominatimClient = axios.create({
  baseURL: "https://nominatim.openstreetmap.org",
  headers: {
    "Accept-Language": "pt-BR",
    "User-Agent": "GlowlyApp/1.0",
  },
});

const STATE_ABBREVIATIONS = {
  Acre: "AC",
  Alagoas: "AL",
  Amapá: "AP",
  Amazonas: "AM",
  Bahia: "BA",
  Ceará: "CE",
  "Distrito Federal": "DF",
  "Espírito Santo": "ES",
  Goiás: "GO",
  Maranhão: "MA",
  "Mato Grosso": "MT",
  "Mato Grosso do Sul": "MS",
  Pará: "PA",
  Paraíba: "PB",
  Paraná: "PR",
  Pernambuco: "PE",
  Piauí: "PI",
  "Rio de Janeiro": "RJ",
  "Rio Grande do Norte": "RN",
  "Rio Grande do Sul": "RS",
  Rondônia: "RO",
  Roraima: "RR",
  "Santa Catarina": "SC",
  "São Paulo": "SP",
  Sergipe: "SE",
  Tocantins: "TO",
};

export const geocodingApi = {
  async search(query) {
    const cleanQuery = query?.trim();

    if (!cleanQuery || cleanQuery.length < 3) {
      return [];
    }

    console.log("Buscando endereço:", cleanQuery);

    try {
      const response = await nominatimClient.get("/search", {
        params: {
          q: cleanQuery,
          format: "json",
          addressdetails: 1,
          countrycodes: "br",
          limit: 6,
        },
      });

      const data = response.data;

      return data.map((item) => {
        const address = item.address || {};

        const city =
          address.city ||
          address.town ||
          address.village ||
          address.municipality ||
          "";

        const state =
          STATE_ABBREVIATIONS[address.state] ||
          address.state_code?.replace("BR-", "") ||
          "";

        return {
          id: String(item.place_id),

          title:
            [address.road, address.house_number]
              .filter(Boolean)
              .join(", ") ||
            item.display_name.split(",").slice(0, 2).join(", ").trim(),

          subtitle: [city, state]
            .filter(Boolean)
            .join(", "),

          address: item.display_name,

          city,

          state,

          cep: address.postcode || "",

          latitude: Number(item.lat),

          longitude: Number(item.lon),
        };
      });
    } catch (error) {
      console.log("========== ERRO NOMINATIM ==========");
      console.log("Status:", error.response?.status);
      console.log("Dados:", error.response?.data);
      console.log("====================================");

      throw new Error(
        "Não foi possível buscar o endereço agora."
      );
    }
  },
};