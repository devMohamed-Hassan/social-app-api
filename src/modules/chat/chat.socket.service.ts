export class ChatSocketServices {
  constructor() {}

  sayHi = (message: string, cb: Function) => {
    console.log(message);
    cb("hello");
  };
}
