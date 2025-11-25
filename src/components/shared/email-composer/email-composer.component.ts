import { ChangeDetectionStrategy, Component, output, input, signal, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface Recipient {
  email: string;
  name: string;
}

export interface EmailData {
  to: Recipient[];
  cc: Recipient[];
  bcc: Recipient[];
  subject: string;
  body: string;
}

@Component({
  selector: 'app-email-composer',
  templateUrl: './email-composer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
})
export class EmailComposerComponent {
  // Inputs & Outputs
  initialRecipients = input<Recipient[]>([]);
  initialSubject = input<string>('');
  close = output<void>();
  send = output<EmailData>();
  
  // Form State
  toRecipients = signal<Recipient[]>([]);
  ccRecipients = signal<Recipient[]>([]);
  bccRecipients = signal<Recipient[]>([]);
  showCcBcc = signal(false);
  subject = signal('');
  bodyContent = signal('');

  toInput = signal('');
  ccInput = signal('');
  bccInput = signal('');

  constructor() {
    effect(() => {
        const initialRecipients = this.initialRecipients();
        if (initialRecipients.length > 0) {
          this.toRecipients.set([...initialRecipients]);
        }
        const initialSub = this.initialSubject();
        if(initialSub) {
          this.subject.set(initialSub);
        }
    });
  }

  addRecipient(type: 'to' | 'cc' | 'bcc') {
    let inputSignal, recipientSignal;
    if (type === 'to') { [inputSignal, recipientSignal] = [this.toInput, this.toRecipients]; }
    else if (type === 'cc') { [inputSignal, recipientSignal] = [this.ccInput, this.ccRecipients]; }
    else { [inputSignal, recipientSignal] = [this.bccInput, this.bccRecipients]; }

    const email = inputSignal().trim();
    if (email) { // Basic email validation can be added here
      recipientSignal.update(pills => [...pills, { email, name: email }]);
      inputSignal.set('');
    }
  }

  removeRecipient(type: 'to' | 'cc' | 'bcc', index: number) {
    let recipientSignal;
    if (type === 'to') { recipientSignal = this.toRecipients; }
    else if (type === 'cc') { recipientSignal = this.ccRecipients; }
    else { recipientSignal = this.bccRecipients; }
    recipientSignal.update(pills => pills.filter((_, i) => i !== index));
  }

  handleSend() {
    if (this.toRecipients().length === 0 && this.ccRecipients().length === 0 && this.bccRecipients().length === 0) {
      alert('Please add at least one recipient.');
      return;
    }
    const emailData: EmailData = {
      to: this.toRecipients(),
      cc: this.ccRecipients(),
      bcc: this.bccRecipients(),
      subject: this.subject(),
      body: this.bodyContent()
    };
    this.send.emit(emailData);
  }
}
