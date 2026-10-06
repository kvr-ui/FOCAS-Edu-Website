import type { Context, MiddlewareFn } from "grammy";

export interface AccessPolicy {
  /** True if the Telegram user may use the bot at all (allowlist, plus the owner). */
  isAllowed(userId: number | undefined): boolean;
  /** True only for the owner — the one user who may ok / deploy / roll back. */
  isOwner(userId: number | undefined): boolean;
}

export function createAccessPolicy(opts: {
  allowedIds: Iterable<number>;
  ownerId: number;
}): AccessPolicy {
  const allowed = new Set(opts.allowedIds);
  allowed.add(opts.ownerId);
  return {
    isAllowed: (id) => id !== undefined && allowed.has(id),
    isOwner: (id) => id !== undefined && id === opts.ownerId,
  };
}

/**
 * grammY middleware that drops every update not sent by an allowed user.
 * Unknown users get no reply at all — the update simply stops here.
 */
export function accessGuard<C extends Context>(policy: AccessPolicy): MiddlewareFn<C> {
  return async (ctx, next) => {
    if (!policy.isAllowed(ctx.from?.id)) return;
    await next();
  };
}
