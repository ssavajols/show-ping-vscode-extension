import { StatusBarItem, commands, window, ExtensionContext, StatusBarAlignment,  } from 'vscode';
import { spawn } from 'child_process';

export class Ping {

  private statusBar: StatusBarItem;
  private _ms: string;
  private _status: string;

  private _onlineText = `$(radio-tower) ONLINE`;
  private _offlineText = `$(alert) NO NETWORK`;

  constructor() {
      this.statusBar = window.createStatusBarItem(StatusBarAlignment.Left);
      this.statusBar.show();

      this.tick();
      setInterval(() => this.tick(), 1000);
  }

  async tick() {

    let pingCommandResult = '';

    try {
      pingCommandResult =  await this.doPing();
    } catch(e) { }
    
    const ms = this.parseMs(pingCommandResult);

    this.setMs(ms);
    this.setStatus(!!ms);
    this.show();
  }

  getStatus(): string {
    return this._status;
  }

  getMs(): string {
    return this._ms;
  }

  setStatus(online: boolean): void {
    this._status = online ? this._onlineText : this._offlineText ;
  }

  setMs(ms: string): void {
    this._ms = ms;
  }

  doPing(): Promise<string> {
      return new Promise((resolve, reject) => {

          const pingCommand = spawn('ping', ['-c 1', 'google.fr']);
          const timer = setTimeout(reject, 1000);

          pingCommand.stdout.on('data', (data: string) => {
              clearTimeout(timer);
              resolve(data.toString());
          });
          
      });
  }

  parseMs(pingCommandResult: string): string {
      const parsed = pingCommandResult.match(/time=(.*)ms/);
      return parsed ? parsed[1] : null;
  }

  show() {
      if( this.getMs() === null ) {
        this.statusBar.text = `${this.getStatus()}`;  
      } else {
        this.statusBar.text = `${this.getStatus()} : ${this.getMs()} ms`;  
      }      
  }

  dispose() {
      this.statusBar.dispose();
  }

}
