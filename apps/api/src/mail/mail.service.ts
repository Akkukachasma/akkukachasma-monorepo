import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';

interface SendEmailParams {
    to: string;
    subject: string;
    body: string;
    closure: string;
    ctaLabel: string;
    href: string;
    template_name: "primary";

}


@Injectable()
export class MailService {
    private readonly transporter: nodemailer.Transporter;

    constructor(private readonly config: ConfigService) {
        let secure = false;
        try {
            secure = JSON.parse(this.config.get<string>('SMTP_SECURE_FLAG') ?? 'false');
        } catch (error) {
            Logger.warn("Please consider adding the SMTP_SECURE_FLAG variable to you .env file.", "MailService");
        }

        this.transporter = nodemailer.createTransport({
            host: this.config.getOrThrow<string>('SMTP_HOST'),
            port: this.config.getOrThrow<string>('SMTP_PORT'),
            secure,
            auth: {
                user: this.config.getOrThrow<string>('SMTP_EMAIL'),
                pass: this.config.getOrThrow<string>('SMTP_PASSWORD')
            }

        } as nodemailer.TransportOptions)
    }


    getHtml(params: SendEmailParams) {
        const devRaw = this.config.get<string>('DEV_ENVIRONMENT');
        let isDev = false;
        try {
            isDev = JSON.parse(devRaw ?? 'false');
        } catch {
            isDev = devRaw === 'true';
        }
        const baseURL = isDev
            ? "http://localhost:3000/"
            : "https://akkukachasma.com/";
        const href = `${baseURL}${params.href}`;

        const fileName = `${params.template_name}.html`;
        const candidates = [
            // Prod/QA: templates beside compiled mail.service.js (dist/src/mail/templates)
            path.join(__dirname, 'templates', fileName),
            // Dockerfile copies templates to WORKDIR/mail/templates
            path.join(process.cwd(), 'mail', 'templates', fileName),
            path.join(process.cwd(), 'dist', 'src', 'mail', 'templates', fileName),
            path.join(process.cwd(), 'dist', 'mail', 'templates', fileName),
            // Local nest --watch / source tree
            path.join(process.cwd(), 'src', 'mail', 'templates', fileName),
        ];
        const templatePath = candidates.find((p) => fs.existsSync(p));
        if (!templatePath) {
            throw new Error(
                `Couldn't find path of ${params.template_name} template for mail service. Tried: ${candidates.join(' | ')}`,
            );
        }

        const template = fs.readFileSync(templatePath, { encoding: 'utf-8' }).toString();

        const compiledTemplate = handlebars.compile(template);
        return compiledTemplate({
            subject: params.subject,
            body: params.body,
            closure: params.closure,
            ctaLabel: params.ctaLabel,
            href: href,
        });
    };

    async sendEmail(params: SendEmailParams) {
        const html = this.getHtml(params);

        const mailOptions: nodemailer.SendMailOptions = {
            from: this.config.getOrThrow<string>('SMTP_EMAIL'),
            to: params.to,
            subject: params.subject,
            html
        }

        try {
            await this.transporter.sendMail(mailOptions);
        } catch (error) {
            console.error('Error sending email:', error.message);
            throw error;
        }
    }

    /** Plain HTML email (e.g. transactional notifications). */
    async sendSimpleHtml(to: string, subject: string, html: string): Promise<string | undefined> {
        const mailOptions: nodemailer.SendMailOptions = {
            from: this.config.getOrThrow<string>('SMTP_EMAIL'),
            to,
            subject,
            html,
        };
        const info = await this.transporter.sendMail(mailOptions);
        return typeof info.messageId === 'string' ? info.messageId : undefined;
    }
}
