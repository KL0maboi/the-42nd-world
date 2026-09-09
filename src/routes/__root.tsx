import {
  HeadContent,
  Scripts,
  createRootRoute,
  useRouter,
} from '@tanstack/react-router';

import appCss from '../styles.css?url';
import { createServerFn } from '@tanstack/react-start';
import z from 'zod';
import { db } from '#/db';
import { RoomPlayerSchema, UserSchema } from '#/db/schema';
import { eq } from 'drizzle-orm';
import { useEffect } from 'react';

const registerAndValidateUser = createServerFn({ method: 'GET', strict: true })
  .validator(
    z.object({
      token: z.string().nullish(),
      name: z.string().max(16).nullish(),
    }),
  )
  .handler(async ({ data }) => {
    let { token, name } = data;

    if (!name) name = `Guest-${Math.floor(Math.random() * 10000)}`;

    async function createUser(name: string) {
      let token = crypto.randomUUID();
      await db.insert(UserSchema).values({ id: token, name });
      return { token, name };
    }

    if (!token) return createUser(name);

    const user = (
      await db.select().from(UserSchema).where(eq(UserSchema.id, token))
    )[0];

    if (!user) return false;

    return { token, name: user.name };
  });

const getUserLobby = createServerFn({ method: 'GET', strict: true })
  .validator(z.object({ token: z.string() }))
  .handler(async ({ data }) => {
    const { token } = data;

    const user_room = (
      await db
        .select()
        .from(RoomPlayerSchema)
        .where(eq(RoomPlayerSchema.userId, token))
    )[0];

    return user_room?.roomId;
  });

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'TanStack Start Starter',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  useEffect(() => {
    let token = localStorage.getItem('token');
    let name = localStorage.getItem('name')?.slice(0, 16);

    if (!name)
      name =
        prompt('Enter your name: (max 16 characters)') ||
        `Guest-${Math.floor(Math.random() * 10000)}`;

    registerAndValidateUser({ data: { token, name } }).then((data) => {
      if (!data) {
        localStorage.clear();
        return location.reload();
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('name', data.name);

      getUserLobby({ data: { token: data.token } }).then((roomId) => {
        if (roomId) {
          router.navigate({ to: '/room/$id', params: { id: roomId } });
        }
      });
    });
  }, []);

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="dark">
        {children}
        {/* <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        /> */}
        <Scripts />
      </body>
    </html>
  );
}
