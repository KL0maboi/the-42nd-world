import { Button } from '#/components/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLegend,
} from '#/components/ui/field';
import { Input } from '#/components/ui/input';
import { db } from '#/db';
import { RoomPlayerSchema, RoomSchema } from '#/db/schema';
import { useForm } from '@tanstack/react-form';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { eq } from 'drizzle-orm';
import { useEffect } from 'react';
import z, { object, string, uuid } from 'zod';

export const Route = createFileRoute('/')({ component: Home });

export const formSchema = object({
  user_id: uuid(),
  room_id: string(),
});

const submitFormFn = createServerFn({ method: 'POST', strict: true })
  .validator(formSchema)
  .handler(async ({ data }) => {
    const id = await db
      .insert(RoomPlayerSchema)
      .values({
        userId: data.user_id,
        roomId: data.room_id,
      })
      .returning({ roomId: RoomPlayerSchema.roomId });

    return id[0].roomId;
  });

const checkIfRoomExistsFn = createServerFn({ method: 'GET', strict: true })
  .validator(object({ roomId: string() }))
  .handler(async ({ data }) => {
    const { roomId } = data;

    const user_room = await db
      .select()
      .from(RoomSchema)
      .where(eq(RoomSchema.id, roomId));

    if (user_room.length === 0) return false;

    return true;
  });

function Home() {
  const router = useRouter();

  function handleText(
    e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>,
  ) {
    let text = e.target.value;

    text = text.toLowerCase();
    text = text.replaceAll(/[^a-z0-9-]/g, '');

    e.target.value = text;
  }

  const form = useForm({
    defaultValues: {
      user_id: '',
      room_id: '',
    } satisfies z.infer<typeof formSchema>,
    validators: { onChange: formSchema },
    onSubmit: async ({ value }) => {
      const id = await submitFormFn({ data: value });

      router.navigate({ to: '/room/$id', params: { id } });
    },
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    form.setFieldValue('user_id', token!);
  }, []);

  return (
    <main className="flex justify-center items-center w-screen h-screen">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="w-sm"
      >
        {/* <Label className="m-4 text-xl">Welcome</Label>
        <Input
          className="w-sm h-12 select-none"
          onChange={console.log}
          placeholder="Enter Party Code"
        />
        */}
        <FieldLegend className="text-lg text-center">Welcome</FieldLegend>
        <FieldGroup>
          <Field className="flex flex-col">
            <form.Field
              name="room_id"
              validators={{
                onChangeAsyncDebounceMs: 500,
                onChangeAsync: async ({ value }) => {
                  if (!uuid().safeParse(value).success) {
                    return { message: 'Invalid room code' };
                  }
                  const roomExists = await checkIfRoomExistsFn({
                    data: { roomId: value },
                  });

                  if (!roomExists) {
                    return { message: 'room not found' };
                  }

                  return undefined;
                },
              }}
            >
              {(field) => {
                const { errors } = field.state.meta;
                return (
                  <>
                    <Input
                      className="w-sm h-12 select-none"
                      onChange={(e) => {
                        handleText(e);
                        field.handleChange(e.target.value);
                      }}
                      value={field.state.value}
                      placeholder="Enter Party Code"
                    />
                    <div
                      className={`grid transition-[grid-template-rows] duration-150 ease-out ${
                        errors.length > 0
                          ? 'grid-rows-[1fr]'
                          : 'grid-rows-[0fr]'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <FieldError
                          errors={errors}
                          className={`grid transition-[grid-template-rows] duration-150 ease-out ${
                            errors.length > 0
                              ? 'grid-rows-[1fr]'
                              : 'grid-rows-[0fr]'
                          }`}
                        />
                      </div>
                    </div>
                  </>
                );
              }}
            </form.Field>
          </Field>
          <div className="flex">
            <Button
              variant="outline"
              className="mx-4 p-8"
              onClick={() => router.navigate({ to: '/host' })}
            >
              Start a Game
            </Button>
            <Button variant="secondary" className="mx-4 p-8" type="submit">
              Join a Game
            </Button>
          </div>
        </FieldGroup>
      </form>
    </main>
  );
}
