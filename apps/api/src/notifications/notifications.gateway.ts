import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { TokenService } from '../token/token.service';
import { TOKENS } from '../../lib/constants';

function parseAllowedOrigins(): string[] {
  const raw = process.env.ALLOWED_ORIGINS;
  if (!raw) return ['http://localhost:3000'];
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

@WebSocketGateway({
  namespace: '/notifications',
  cors: {
    origin: parseAllowedOrigins(),
    credentials: true,
  },
})
export class NotificationsGateway implements OnGatewayConnection {
  private readonly logger = new Logger(NotificationsGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(private readonly tokenService: TokenService) {}

  async handleConnection(client: Socket) {
    const userId = await this.resolveUserId(client);
    if (!userId) {
      this.logger.warn('WS notifications: unauthenticated connection rejected');
      client.disconnect(true);
      return;
    }
    const room = this.roomForUser(userId);
    await client.join(room);
    client.data.userId = userId;
  }

  /** Push a notification payload to one user's room (all their tabs). */
  emitToUser(userId: string, event: string, payload: unknown) {
    if (!this.server) return;
    this.server.to(this.roomForUser(userId)).emit(event, payload);
  }

  roomForUser(userId: string): string {
    return `user:${userId}`;
  }

  private async resolveUserId(client: Socket): Promise<string | null> {
    const authToken =
      (client.handshake.auth?.token as string | undefined) ||
      (client.handshake.auth?.accessToken as string | undefined);
    if (authToken) {
      try {
        const payload: any = this.tokenService.verifyToken(authToken);
        if (payload?.id) return String(payload.id);
      } catch {
        return null;
      }
    }
    const cookieHeader = client.handshake.headers?.cookie;
    if (cookieHeader) {
      const token = this.extractCookie(cookieHeader, TOKENS.auth_token);
      if (token) {
        try {
          const payload: any = this.tokenService.verifyToken(token);
          if (payload?.id) return String(payload.id);
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  private extractCookie(header: string, name: string): string | null {
    const parts = header.split(';').map((c) => c.trim());
    const prefix = `${name}=`;
    for (const p of parts) {
      if (p.startsWith(prefix)) {
        return decodeURIComponent(p.slice(prefix.length));
      }
    }
    return null;
  }
}
