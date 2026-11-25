"use client";

import { useActionState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { FormField } from "@/components/forms/form-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { initialFormState } from "@/lib/form";
import {
  createPropertyAction,
  updatePropertyAction,
} from "@/modules/properties/actions";
import {
  PROPERTY_TYPES,
  PROPERTY_TYPE_LABELS,
  type PropertyTypeValue,
} from "@mh/contracts";

export type PropertyFormValues = {
  title: string;
  description: string;
  type: PropertyTypeValue;
  price: string;
  bedrooms: number;
  bathrooms: number;
  parkingSpaces: number;
  areaM2: number | null;
  city: string;
  neighborhood: string;
  addressLine: string | null;
  imageUrls: string;
};

const EMPTY_VALUES: PropertyFormValues = {
  title: "",
  description: "",
  type: "APARTMENT",
  price: "",
  bedrooms: 1,
  bathrooms: 1,
  parkingSpaces: 0,
  areaM2: null,
  city: "Quibdó",
  neighborhood: "",
  addressLine: "",
  imageUrls: "",
};

type PropertyFormProps = {
  mode: "create" | "edit";
  propertyId?: string;
  defaultValues?: Partial<PropertyFormValues>;
};

export function PropertyForm({
  mode,
  propertyId,
  defaultValues,
}: PropertyFormProps) {
  const values = { ...EMPTY_VALUES, ...defaultValues };
  const action =
    mode === "create" ? createPropertyAction : updatePropertyAction;
  const [state, formAction] = useActionState(action, initialFormState);

  const errorFor = (field: keyof PropertyFormValues) =>
    state.fieldErrors?.[field]?.[0];

  return (
    <form action={formAction} className="space-y-6">
      {propertyId ? (
        <input type="hidden" name="propertyId" value={propertyId} />
      ) : null}

      {state.status === "error" && state.message ? (
        <Alert variant="destructive">
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Información básica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            id="title"
            label="Título de la publicación"
            error={errorFor("title")}
          >
            <Input
              id="title"
              name="title"
              required
              maxLength={120}
              defaultValue={values.title}
              placeholder="Apartamento 2 habitaciones cerca al Malecón"
            />
          </FormField>

          <FormField
            id="description"
            label="Descripción"
            error={errorFor("description")}
          >
            <Textarea
              id="description"
              name="description"
              required
              rows={6}
              maxLength={4000}
              defaultValue={values.description}
              placeholder="Describe el estado del inmueble, servicios incluidos, condiciones…"
            />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              id="type"
              label="Tipo de inmueble"
              error={errorFor("type")}
            >
              <NativeSelect
                id="type"
                name="type"
                defaultValue={values.type}
                required
              >
                {PROPERTY_TYPES.map((value) => (
                  <option key={value} value={value}>
                    {PROPERTY_TYPE_LABELS[value]}
                  </option>
                ))}
              </NativeSelect>
            </FormField>

            <FormField
              id="price"
              label="Canon mensual (COP)"
              hint="Monto en pesos colombianos."
              error={errorFor("price")}
            >
              <Input
                id="price"
                name="price"
                type="number"
                min={1}
                step={1000}
                required
                defaultValue={values.price}
                placeholder="950000"
              />
            </FormField>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Características</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FormField
            id="bedrooms"
            label="Habitaciones"
            error={errorFor("bedrooms")}
          >
            <Input
              id="bedrooms"
              name="bedrooms"
              type="number"
              min={0}
              max={30}
              defaultValue={values.bedrooms}
            />
          </FormField>
          <FormField id="bathrooms" label="Baños" error={errorFor("bathrooms")}>
            <Input
              id="bathrooms"
              name="bathrooms"
              type="number"
              min={0}
              max={30}
              defaultValue={values.bathrooms}
            />
          </FormField>
          <FormField
            id="parkingSpaces"
            label="Parqueaderos"
            error={errorFor("parkingSpaces")}
          >
            <Input
              id="parkingSpaces"
              name="parkingSpaces"
              type="number"
              min={0}
              max={30}
              defaultValue={values.parkingSpaces}
            />
          </FormField>
          <FormField id="areaM2" label="Área (m²)" error={errorFor("areaM2")}>
            <Input
              id="areaM2"
              name="areaM2"
              type="number"
              min={0}
              max={5000}
              defaultValue={values.areaM2 ?? ""}
            />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ubicación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="city" label="Ciudad" error={errorFor("city")}>
              <Input
                id="city"
                name="city"
                required
                defaultValue={values.city}
              />
            </FormField>
            <FormField
              id="neighborhood"
              label="Barrio"
              error={errorFor("neighborhood")}
            >
              <Input
                id="neighborhood"
                name="neighborhood"
                required
                defaultValue={values.neighborhood}
                placeholder="Centro"
              />
            </FormField>
          </div>

          <FormField
            id="addressLine"
            label="Dirección exacta (privada)"
            hint="Solo la verán tú y los moderadores. No se publica en el catálogo."
            error={errorFor("addressLine")}
          >
            <Input
              id="addressLine"
              name="addressLine"
              maxLength={160}
              defaultValue={values.addressLine ?? ""}
              placeholder="Calle 25 # 4-30, apto 302"
            />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Fotografías</CardTitle>
        </CardHeader>
        <CardContent>
          <FormField
            id="imageUrls"
            label="URLs de las imágenes"
            hint="Una por línea. La primera se usa como portada. Máximo 20."
            error={errorFor("imageUrls")}
          >
            <Textarea
              id="imageUrls"
              name="imageUrls"
              rows={4}
              defaultValue={values.imageUrls}
              placeholder={
                "https://ejemplo.com/foto1.jpg\nhttps://ejemplo.com/foto2.jpg"
              }
            />
          </FormField>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton
          pendingLabel={mode === "create" ? "Publicando…" : "Guardando…"}
        >
          {mode === "create" ? "Publicar inmueble" : "Guardar cambios"}
        </SubmitButton>
        <p className="text-muted-foreground text-xs">
          Toda publicación pasa por revisión antes de ser visible al público.
        </p>
      </div>
    </form>
  );
}
