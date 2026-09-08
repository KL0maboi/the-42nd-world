import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router';

import appCss from '../styles.css?url';
import { createClientOnlyFn, createServerFn } from '@tanstack/react-start';
import z from 'zod';
import { db } from '#/db';
import { UserSchema } from '#/db/schema';
import { eq } from 'drizzle-orm';
import { useEffect } from 'react';

const getClientToken = createClientOnlyFn(() => localStorage.getItem('token'));
const setClientToken = createClientOnlyFn((token: string) =>
  localStorage.setItem('token', token),
);

const registerAndValidateToken = createServerFn({ method: 'GET', strict: true })
  .validator(
    z.object({
      token: z.string().nullish(),
    }),
  )
  .handler(async ({ data }) => {
    const { token } = data;

    async function createUser() {
      let token = crypto.randomUUID();
      await db.insert(UserSchema).values({ id: token });
      return token;
    }

    if (!token) return createUser();

    const user = (
      await db.select().from(UserSchema).where(eq(UserSchema.id, token))
    )[0];

    if (!user) return createUser();

    return token;
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
  useEffect(() => {
    let token = getClientToken();

    registerAndValidateToken({ data: { token } }).then((token) => {
      setClientToken(token);
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
