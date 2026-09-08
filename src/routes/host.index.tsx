import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useForm } from '@tanstack/react-form';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
} from '#/components/ui/field';
import { Input } from '#/components/ui/input';
import z from 'zod';
import { Button } from '#/components/ui/button';
import { Slider } from '#/components/ui/slider';
import { useEffect, useState } from 'react';
import { createServerFn } from '@tanstack/react-start';
import { db } from '#/db';
import { RoomPlayerSchema, RoomSchema } from '#/db/schema';

export const Route = createFileRoute('/host/')({
  component: RouteComponent,
});

export const formSchema = z.object({
  host_id: z.uuid(),
  name: z.string().min(4).max(16),
  maxPlayerCount: z.number().min(4).max(12),
});

const submitFormFn = createServerFn({ method: 'POST', strict: true })
  .validator(formSchema)
  .handler(async ({ data }) => {
    const result = (
      await db
        .insert(RoomSchema)
        .values({
          name: data.name,
          maxPlayerCount: data.maxPlayerCount,
        })
        .returning({ id: RoomSchema.id })
    )[0];

    await db.insert(RoomPlayerSchema).values({
      roomId: result.id,
      userId: data.host_id, // Replace with actual user ID
    });

    return result.id;
  });

function RouteComponent() {
  const router = useRouter();
  const form = useForm({
    defaultValues: {
      host_id: '',
      name: '',
      maxPlayerCount: 8,
    } satisfies z.infer<typeof formSchema>,
    validators: { onChange: formSchema },
    onSubmit: async ({ value }) => {
      const id = await submitFormFn({ data: value });

      router.navigate({ to: '/room/$id', params: { id } });
    },
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    form.setFieldValue('host_id', token!);
  }, []);

  const [sliderValue, setSliderValue] = useState(8);

  return (
    <main className="flex flex-col justify-center items-center w-screen h-screen">
      <form
        action="submit"
        className="bg-foreground/5 p-8 rounded-md w-lg h-auto"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <FieldGroup>
          <FieldLegend>Create Room</FieldLegend>
          <FieldGroup>
            <Field>
              <FieldLabel>Room Name</FieldLabel>
              <form.Field name="name">
                {(field) => {
                  const { errors } = field.state.meta;
                  return (
                    <>
                      <Input
                        name="name"
                        autoComplete="off"
                        min={3}
                        placeholder="Room 101"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
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
            <Field>
              <FieldLabel>Player Count - {sliderValue}</FieldLabel>
              <form.Field name="maxPlayerCount">
                {(field) => {
                  const { errors } = field.state.meta;
                  return (
                    <>
                      <Slider
                        defaultValue={[8]}
                        max={12}
                        min={4}
                        step={1}
                        onValueChange={(n) => {
                          form.setFieldValue('maxPlayerCount', n[0]);
                          setSliderValue(n[0]);
                        }}
                        className="cursor-pointer"
                      />
                      <FieldError errors={errors} />
                    </>
                  );
                }}
              </form.Field>
              <FieldError />
            </Field>
            <Button type="submit" children="Host Lobby" />
          </FieldGroup>
        </FieldGroup>
      </form>
    </main>
  );
}
