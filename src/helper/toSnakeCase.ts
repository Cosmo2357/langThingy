// make function that switch the case of of key of object and array 
function camelToSnake(str: string):string {
  return str.replace(/[A-Z]/g, function (s) {
    return "_" + s.charAt(0).toLowerCase();
  });
} 

function toStakeCase(obj: any):any {
  if (Array.isArray(obj)) {
    return obj.map(v => toStakeCase(v));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [camelToSnake(k), v])
    );
  } else {
    return obj;
  }
}

export { camelToSnake, toStakeCase };