import handlebars, { Exception } from "handlebars";
import { Injectable, Scope } from "@nestjs/common";
import { createTransport } from "nodemailer";
import path from "node:path";
import fs from "node:fs";

export interface IEmailOptions {
  to: string;
  cc?: string | string[];
  subject: string;
  template?: {
    name: string;
    local?: Record<string, any>
  },
  html?:string;
  text?:string;
}


@Injectable({ scope: Scope.TRANSIENT })
export class EmailService {
  public send(options:IEmailOptions) {
    const transport = createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT ?? "0"),
      secure: process.env.SMTP_SECURE == "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PWD
      }
    });

    const emailConfig = {
      from: `"AVI-AAA"<${process.env.SMTP_USER}>`,
      to: options.to,
      cc: options.cc,
      subject: options.subject,
      html: options.html,
      text: options.text
    };

    try {
      if (options.template) {
        const filepath = path.join(process.cwd(), "emails", `${options.template.name}.html`);

        if (fs.existsSync(filepath)) {
          const file = fs.readFileSync(filepath);
          const template = handlebars.compile(file.toString());
          emailConfig.html = template(options.template.local);
        }
      }

      transport.sendMail(emailConfig);
    }
    catch (err) {
      throw new Exception(err?.toString());
    }
  }
}
