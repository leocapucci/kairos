export async function request(url: string) {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error('API error');
  }

  return res.json();
}
