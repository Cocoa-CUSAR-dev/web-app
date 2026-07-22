async function getRandomNumberArray(count: number) {
  if (count < 0) {
    return [];
  }
  const arr = [];
  for (let i = 0; i < count; i++) {
    arr.push(Math.floor(Math.random() * 100));
  }
  return arr;
}

export { getRandomNumberArray };
