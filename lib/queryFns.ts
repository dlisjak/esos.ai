export async function queueAsyncFns(fns: any) {
  const values: any = [];

  await fns.reduce((previous: any, current: any, index: any, array: any) => {
    const thenable = index === 1 ? previous() : previous;
    return thenable.then((value: any) => {
      values.push(value);

      return index === array.length - 1
        ? current().then((value: any) => values.push(value))
        : current();
    });
  });

  return values;
}
