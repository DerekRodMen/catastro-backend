import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly transporter:
    nodemailer.Transporter;

  constructor() {
    const host =
      process.env.MAIL_HOST;

    const port =
      Number(
        process.env.MAIL_PORT ||
          587,
      );

    const user =
      process.env.MAIL_USER;

    const password =
      process.env.MAIL_PASSWORD;

    if (!host) {
      throw new Error(
        'MAIL_HOST no está configurado en el archivo .env',
      );
    }

    if (!user) {
      throw new Error(
        'MAIL_USER no está configurado en el archivo .env',
      );
    }

    if (!password) {
      throw new Error(
        'MAIL_PASSWORD no está configurado en el archivo .env',
      );
    }

    this.transporter =
      nodemailer.createTransport({
        host,

        port,

        secure:
          process.env.MAIL_SECURE ===
          'true',

        auth: {
          user,
          pass: password,
        },
      });
  }

  // ============================================
  // ENVIAR INVITACIÓN DE USUARIO
  // ============================================

  async enviarInvitacionUsuario(
    correo: string,
    token: string,
  ): Promise<void> {
    try {
      const frontendUrl =
        process.env.FRONTEND_URL ||
        'http://localhost:5173';

      const enlaceActivacion =
        `${frontendUrl}/activar-cuenta?token=${encodeURIComponent(
          token,
        )}`;

      const remitente =
        process.env.MAIL_FROM;

      if (!remitente) {
        throw new Error(
          'MAIL_FROM no está configurado en el archivo .env',
        );
      }

      await this.transporter.sendMail({
        from:
          remitente,

        to:
          correo,

        subject:
          'Invitación al sistema de Catastro',

        html: `
          <div
            style="
              font-family: Arial, Helvetica, sans-serif;
              max-width: 600px;
              margin: 0 auto;
              padding: 30px;
              color: #1e293b;
            "
          >

            <h2>
              Sistema de Catastro
            </h2>

            <p>
              Se ha creado una cuenta para usted
              en el sistema de Catastro.
            </p>

            <p>
              Por seguridad, el administrador
              no establece ni conoce su contraseña.
            </p>

            <p>
              Utilice el siguiente botón para
              crear su contraseña:
            </p>

            <div
              style="
                margin: 30px 0;
              "
            >

              <a
                href="${enlaceActivacion}"
                style="
                  display: inline-block;
                  background-color: #2563eb;
                  color: #ffffff;
                  padding: 12px 20px;
                  text-decoration: none;
                  border-radius: 8px;
                  font-weight: bold;
                "
              >
                Crear contraseña
              </a>

            </div>

            <p
              style="
                font-size: 14px;
                color: #64748b;
              "
            >
              Este enlace es personal,
              temporal y de un solo uso.
            </p>

            <p
              style="
                font-size: 14px;
                color: #64748b;
              "
            >
              Si usted no esperaba esta invitación,
              puede ignorar este mensaje.
            </p>

          </div>
        `,
      });

      console.log(
        `Invitación enviada correctamente a ${correo}`,
      );
    } catch (error) {
      console.error(
        'Error enviando invitación:',
        error,
      );

      throw new InternalServerErrorException(
        'No se pudo enviar el correo de invitación.',
      );
    }
  }

  // ============================================
  // ENVIAR RECUPERACIÓN DE CONTRASEÑA
  // ============================================

  async enviarRecuperacionPassword(
    correo: string,
    token: string,
  ): Promise<void> {
    try {
      const frontendUrl =
        process.env.FRONTEND_URL ||
        'http://localhost:5173';

      const enlaceRecuperacion =
        `${frontendUrl}/restablecer-password?token=${encodeURIComponent(
          token,
        )}`;

      const remitente =
        process.env.MAIL_FROM;

      if (!remitente) {
        throw new Error(
          'MAIL_FROM no está configurado en el archivo .env',
        );
      }

      await this.transporter.sendMail({
        from:
          remitente,

        to:
          correo,

        subject:
          'Restablecer contraseña - Sistema de Catastro',

        html: `
          <div
            style="
              font-family: Arial, Helvetica, sans-serif;
              max-width: 600px;
              margin: 0 auto;
              padding: 30px;
              color: #1e293b;
            "
          >

            <h2>
              Sistema de Catastro
            </h2>

            <p>
              Recibimos una solicitud para
              restablecer la contraseña de su cuenta.
            </p>

            <p>
              Utilice el siguiente botón para
              crear una nueva contraseña:
            </p>

            <div
              style="
                margin: 30px 0;
              "
            >

              <a
                href="${enlaceRecuperacion}"
                style="
                  display: inline-block;
                  background-color: #2563eb;
                  color: #ffffff;
                  padding: 12px 20px;
                  text-decoration: none;
                  border-radius: 8px;
                  font-weight: bold;
                "
              >
                Restablecer contraseña
              </a>

            </div>

            <p
              style="
                font-size: 14px;
                color: #64748b;
              "
            >
              Este enlace es personal,
              temporal y de un solo uso.
            </p>

            <p
              style="
                font-size: 14px;
                color: #64748b;
              "
            >
              Si usted no solicitó un cambio
              de contraseña, puede ignorar
              este mensaje.
            </p>

          </div>
        `,
      });

      console.log(
        `Correo de recuperación enviado correctamente a ${correo}`,
      );
    } catch (error) {
      console.error(
        'Error enviando recuperación de contraseña:',
        error,
      );

      throw new InternalServerErrorException(
        'No se pudo enviar el correo de recuperación de contraseña.',
      );
    }
  }
}