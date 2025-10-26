import { DurableObject } from "cloudflare:workers";

export class AlertDO extends DurableObject {
  private storage: DurableObjectStorage;
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.storage = ctx.storage;
  }

  async getTime() {
    return this.storage.getAlarm();
  }

  async setTime(time: number | Date) {
    await this.storage.setAlarm(time);
    return {
      time,
    };
  }

  async deleteTime() {
    return this.storage.deleteAlarm();
  }

  async alarm() {
    // The alarm handler will be invoked whenever an alarm fires.
    // You can use this to do work, read from the Storage API, make HTTP calls
    // and set future alarms to run using this.storage.setAlarm() from within this handler.
  }
}
