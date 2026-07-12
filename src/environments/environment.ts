export const environment = {
  production: false,
  // Quando o back-end real estiver pronto, troque a URL abaixo.
  apiUrl: 'http://localhost:8000/api',
  // Enquanto isso, o mockBackendInterceptor responde no lugar da API real,
  // persistindo os dados em localStorage. Basta trocar para "false" quando
  // a API estiver no ar — nenhum componente/serviço precisa mudar.
  useMockBackend: false,
};
