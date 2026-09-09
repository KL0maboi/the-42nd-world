import { Button } from '#/components/ui/button';
import { db } from '#/db';
import { RoomPlayerSchema } from '#/db/schema';
import { createFileRoute, useParams, useRouter } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { eq } from 'drizzle-orm';
import { useEffect, useState } from 'react';
import { object, string } from 'zod';

export const Route = createFileRoute('/room/$id/')({
  component: RouteComponent,
});

const checkIfRoomExistsFn = createServerFn({ method: 'GET', strict: true })
  .validator(object({ roomId: string() }))
  .handler(async ({ data }) => {
    const { roomId } = data;

    const user_room = await db
      .select()
      .from(RoomPlayerSchema)
      .where(eq(RoomPlayerSchema.roomId, roomId));

    if (user_room.length === 0) return false;

    return true;
  });

const exitRoomFn = createServerFn({ method: 'POST', strict: true })
  .validator(object({ token: string() }))
  .handler(async ({ data }) => {
    const { token } = data;

    await db.delete(RoomPlayerSchema).where(eq(RoomPlayerSchema.userId, token));
  });

function RouteComponent() {
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();
  const id = useParams({
    from: '/room/$id/',
    select: (params) => params.id,
  });

  checkIfRoomExistsFn({ data: { roomId: id } }).then((exists) => {
    if (!exists) {
      router.navigate({ to: '/' });
    }
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    setToken(token);
  }, []);

  function handleExitRoom(token: string) {
    exitRoomFn({ data: { token } });
    router.navigate({ to: '/' });
  }

  return (
    <Button
      variant="destructive"
      onClick={() => handleExitRoom(token!)}
      size={'lg'}
      disabled={!token}
      className="top-4 right-2 absolute px-6 py-6 text-lg"
    >
      Exit
    </Button>
  );
}
