import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, decodeJwtToken, normalizeAppRole, type AppRole } from '@/lib/auth';
import {
  assertNewsletterPermission,
  canViewNewsletter,
} from '@/lib/newsletter/permissions';
import {
  deleteServerNewsletterPost,
  findServerNewsletterPost,
  isValidNewsletterCategory,
  listServerNewsletterPosts,
  publishServerNewsletterPost,
  updateServerNewsletterPost,
} from '@/lib/newsletter/server-store';
import type { PublishedAttachment } from '@/lib/newsletter/types';

type NewsletterActor = {
  id: string;
  email: string;
  name: string;
  role: AppRole;
};

function getActor(request: NextRequest, body?: Record<string, unknown>): NewsletterActor | null {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value ?? request.headers.get('x-auth-token');
  const decoded = decodeJwtToken(token);
  if (decoded) {
    return {
      id: decoded.id,
      email: decoded.email,
      name: request.headers.get('x-user-name') || decoded.name || decoded.email,
      role: normalizeAppRole(decoded.role),
    };
  }

  if (!body) return null;
  const email = String(body.actorEmail ?? '');
  const id = String(body.actorId ?? '');
  const name = String(body.actorName ?? email);
  const role = normalizeAppRole(String(body.actorRole ?? ''));
  if (!email || !id) return null;
  return { id, email, name, role };
}

function parseAttachment(value: unknown): PublishedAttachment | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const item = value as Record<string, unknown>;
  const fileName = String(item.fileName ?? '');
  const dataUrl = String(item.dataUrl ?? '');
  if (!fileName || !dataUrl) return undefined;
  return {
    fileName,
    fileSize: Number(item.fileSize ?? 0),
    mimeType: String(item.mimeType ?? 'application/pdf'),
    dataUrl,
  };
}

export async function GET(request: NextRequest) {
  try {
    const actor = getActor(request);
    if (!actor || !canViewNewsletter(actor.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = request.nextUrl.searchParams.get('id');
    if (id) {
      const post = findServerNewsletterPost(id);
      if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      return NextResponse.json({ post });
    }

    return NextResponse.json({ posts: listServerNewsletterPosts() });
  } catch (error) {
    console.error('Newsletter GET error:', error);
    return NextResponse.json({ error: 'Failed to load newsletters' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const actor = getActor(request, body);
    if (!actor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      assertNewsletterPermission(actor.role, 'newsletter:publish');
      assertNewsletterPermission(actor.role, 'newsletter:create');
    } catch {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const title = String(body.title ?? '').trim();
    const category = String(body.category ?? '');
    const content = String(body.body ?? '').trim();
    const attachment = parseAttachment(body.attachment);

    if (title.length < 4) {
      return NextResponse.json({ error: 'Title must be at least 4 characters.' }, { status: 400 });
    }
    if (content.length < 20) {
      return NextResponse.json({ error: 'Content must be at least 20 characters.' }, { status: 400 });
    }
    if (!isValidNewsletterCategory(category)) {
      return NextResponse.json({ error: 'Invalid category.' }, { status: 400 });
    }
    if (attachment) {
      try {
        assertNewsletterPermission(actor.role, 'newsletter:upload');
      } catch {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const post = publishServerNewsletterPost({
      title,
      category,
      body: content,
      author: String(body.author ?? actor.name),
      authorImage: body.authorImage ? String(body.authorImage) : undefined,
      attachment,
    });

    return NextResponse.json({ post, message: 'Newsletter published.' }, { status: 201 });
  } catch (error) {
    console.error('Newsletter POST error:', error);
    return NextResponse.json({ error: 'Failed to publish newsletter' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const actor = getActor(request, body);
    if (!actor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      assertNewsletterPermission(actor.role, 'newsletter:edit');
    } catch {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const id = String(body.id ?? '');
    const title = String(body.title ?? '').trim();
    const category = String(body.category ?? '');
    const content = String(body.body ?? '').trim();

    if (!id) return NextResponse.json({ error: 'Missing newsletter id.' }, { status: 400 });
    if (title.length < 4) {
      return NextResponse.json({ error: 'Title must be at least 4 characters.' }, { status: 400 });
    }
    if (content.length < 20) {
      return NextResponse.json({ error: 'Content must be at least 20 characters.' }, { status: 400 });
    }
    if (!isValidNewsletterCategory(category)) {
      return NextResponse.json({ error: 'Invalid category.' }, { status: 400 });
    }

    const attachment =
      body.attachment === null
        ? null
        : body.attachment !== undefined
          ? parseAttachment(body.attachment)
          : undefined;

    if (attachment) {
      try {
        assertNewsletterPermission(actor.role, 'newsletter:upload');
      } catch {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const post = updateServerNewsletterPost(id, {
      title,
      category,
      body: content,
      attachment,
    });

    return NextResponse.json({ post, message: 'Newsletter updated.' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update newsletter';
    const status = message.includes('not found') ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const actor = getActor(request, body);
    if (!actor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      assertNewsletterPermission(actor.role, 'newsletter:delete');
    } catch {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const id = String(body.id ?? request.nextUrl.searchParams.get('id') ?? '');
    if (!id) return NextResponse.json({ error: 'Missing newsletter id.' }, { status: 400 });

    const post = deleteServerNewsletterPost(id);
    return NextResponse.json({ post, message: 'Newsletter deleted.' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete newsletter';
    const status = message.includes('not found') ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
