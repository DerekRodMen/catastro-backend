import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly resend: Resend;

  constructor() {
    const apiKey =
      process.env.RESEND_API_KEY;

    if (!apiKey) {
      throw new Error(
        'RESEND_API_KEY no está configurado en el archivo .env',
      );
    }

    this.resend =
      new Resend(apiKey);
  }

  // ============================================
  // INVITACIÓN DE USUARIO
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
        `${frontendUrl}/activar-cuenta?token=${encodeURIComponent(token)}`;

      const remitente =
        process.env.MAIL_FROM ||
        'Catastro <onboarding@resend.dev>';

      const resultado =
        await this.resend.emails.send({
          from: remitente,

          to: [
            correo,
          ],

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
              <h2
                style="
                  margin-bottom: 20px;
                "
              >
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

      if (resultado.error) {
        console.error(
          'Error de Resend:',
          resultado.error,
        );

        throw new InternalServerErrorException(
          'No se pudo enviar el correo de invitación.',
        );
      }
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
  // RECUPERACIÓN DE CONTRASEÑA
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
        `${frontendUrl}/restablecer-password?token=${encodeURIComponent(token)}`;

      const remitente =
        process.env.MAIL_FROM ||
        'Catastro <onboarding@resend.dev>';

      const resultado =
        await this.resend.emails.send({
          from: remitente,

          to: [
            correo,
          ],

          subject:
            'Recuperación de contraseña - Sistema de Catastro',

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
                Recuperación de contraseña
              </h2>

              <p>
                Se recibió una solicitud para
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
                Este enlace es temporal
                y de un solo uso.
              </p>

              <p
                style="
                  font-size: 14px;
                  color: #64748b;
                "
              >
                Si usted no solicitó este cambio,
                puede ignorar este correo.
              </p>
            </div>
          `,
        });

      if (resultado.error) {
        console.error(
          'Error de Resend:',
          resultado.error,
        );

        throw new InternalServerErrorException(
          'No se pudo enviar el correo de recuperación.',
        );
      }
    } catch (error) {
      console.error(
        'Error enviando recuperación:',
        error,
      );

      throw new InternalServerErrorException(
        'No se pudo enviar el correo de recuperación.',
      );
    }
  }
}