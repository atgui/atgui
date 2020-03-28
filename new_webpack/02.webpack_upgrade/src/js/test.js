import '../css/index.less';

export function add(...args) {
  return args.reduce((a, b) => a + b, 0);
}

export function mul(a, b) {
  return a * b;
}
