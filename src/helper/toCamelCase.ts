function snakeToCamel(str: string): string {
  return str.replace(/(_\w)/g, matches => matches[1].toUpperCase());
}

function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(v => toCamelCase(v));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => {
        if (v !== null && typeof v === 'object') {
          // オブジェクトが入れ子になっている場合、再帰的に変換
          return [snakeToCamel(k), toCamelCase(v)];
        } else {
          return [snakeToCamel(k), v];
        }
      })
    );
  } else {
    return obj;
  }
}

export { snakeToCamel, toCamelCase };
