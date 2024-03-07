/**
 * Преобразует строку вида:
 * "/api/v2/something/123456/some-bff/123456"
 * в строку вида:
 * "/api/v2/something/{id}/some-bff/123456"
 * и возвращает кортеж с этой строкой и вырезанным числом в случае если оно найдено.
 * @param url Url.
 * @return Кортеж со строкой и результатом поиска числа.
 */
export function hideFirstId(url: string): [string, number | undefined] {
  const found = /\d{2,}/.exec(url);

  return found ? [url.replace(found[0], '{id}'), Number(found[0])] : [url, undefined];
}
