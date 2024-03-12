/**
 * Провайдер render-функции.
 * @return Render-Функция.
 */
export function providePageRender() {
  return () => (
    <>
      <h1>Hello, world!</h1>
      <p>This is a stub page. Define the render component in your handler app</p>
    </>
  );
}
