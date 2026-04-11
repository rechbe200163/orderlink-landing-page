'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@workspace/ui/components/card';
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from '@workspace/ui/components/field';
import { IconLoader2, IconCheck, IconBuilding, IconMapPin } from '@tabler/icons-react';
import { createTenant } from '@/lib/actions/onboarding/actions';

interface FormState {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export function OnboardingForm() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [isPending, setIsPending] = useState(false);
  const [formState, setFormState] = useState<FormState>({});

  const [formData, setFormData] = useState({
    companyName: '',
    description: '',
    streetName: '',
    streetNumber: '',
    postCode: '',
    city: '',
    state: '',
    country: 'Deutschland',
  });

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formState.fieldErrors?.[field]) {
      setFormState((prev) => ({
        ...prev,
        fieldErrors: {
          ...prev.fieldErrors,
          [field]: [],
        },
      }));
    }
  };

  const validateStep1 = () => {
    const errors: Record<string, string[]> = {};
    if (!formData.companyName.trim()) {
      errors.companyName = ['Firmenname ist erforderlich'];
    }
    if (Object.keys(errors).length > 0) {
      setFormState({ fieldErrors: errors });
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const errors: Record<string, string[]> = {};
    if (!formData.streetName.trim()) {
      errors.streetName = ['Straße ist erforderlich'];
    }
    if (!formData.streetNumber.trim()) {
      errors.streetNumber = ['Hausnummer ist erforderlich'];
    }
    if (!formData.postCode.trim()) {
      errors.postCode = ['PLZ ist erforderlich'];
    }
    if (!formData.city.trim()) {
      errors.city = ['Stadt ist erforderlich'];
    }
    if (!formData.country.trim()) {
      errors.country = ['Land ist erforderlich'];
    }
    if (Object.keys(errors).length > 0) {
      setFormState({ fieldErrors: errors });
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setFormState({});
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setIsPending(true);
    setFormState({});

    try {
      const result = await createTenant({
        tenant: {
          companyName: formData.companyName,
          description: formData.description || undefined,
        },
        address: {
          streetName: formData.streetName,
          streetNumber: formData.streetNumber,
          postCode: formData.postCode,
          city: formData.city,
          state: formData.state || formData.city,
          country: formData.country,
        },
      });

      if (result.success) {
        setFormState({ success: true });
        setTimeout(() => {
          router.push('/auth/signin');
        }, 2000);
      } else {
        setFormState({ error: result.error || 'Ein Fehler ist aufgetreten' });
      }
    } catch {
      setFormState({ error: 'Ein unerwarteter Fehler ist aufgetreten' });
    } finally {
      setIsPending(false);
    }
  };

  if (formState.success) {
    return (
      <Card>
        <CardContent className='py-12 text-center'>
          <div className='mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10'>
            <IconCheck className='size-8 text-primary' />
          </div>
          <h2 className='text-xl font-semibold'>Account erfolgreich erstellt</h2>
          <p className='mt-2 text-muted-foreground'>
            Du wirst in Kürze zur Anmeldung weitergeleitet...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className='mb-4 flex items-center gap-4'>
          <div className='flex items-center gap-2'>
            <div
              className={`flex size-8 items-center justify-center rounded-full text-sm font-medium ${
                step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              {step > 1 ? <IconCheck className='size-4' /> : '1'}
            </div>
            <span className={step >= 1 ? 'font-medium' : 'text-muted-foreground'}>
              Unternehmen
            </span>
          </div>
          <div className='h-px flex-1 bg-border' />
          <div className='flex items-center gap-2'>
            <div
              className={`flex size-8 items-center justify-center rounded-full text-sm font-medium ${
                step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              2
            </div>
            <span className={step >= 2 ? 'font-medium' : 'text-muted-foreground'}>
              Adresse
            </span>
          </div>
        </div>
        <CardTitle className='flex items-center gap-2'>
          {step === 1 ? (
            <>
              <IconBuilding className='size-5 text-primary' />
              Unternehmensdaten
            </>
          ) : (
            <>
              <IconMapPin className='size-5 text-primary' />
              Geschäftsadresse
            </>
          )}
        </CardTitle>
        <CardDescription>
          {step === 1
            ? 'Gib die grundlegenden Informationen zu deinem Unternehmen ein.'
            : 'Wo ist dein Unternehmen ansässig?'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={step === 2 ? handleSubmit : (e) => { e.preventDefault(); handleNextStep(); }}>
          {formState.error && (
            <div className='mb-6 rounded-lg bg-destructive/10 p-4 text-sm text-destructive'>
              {formState.error}
            </div>
          )}

          {step === 1 && (
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor='companyName'>
                  Firmenname <span className='text-destructive'>*</span>
                </FieldLabel>
                <Input
                  id='companyName'
                  name='companyName'
                  placeholder='Muster GmbH'
                  value={formData.companyName}
                  onChange={(e) => updateField('companyName', e.target.value)}
                  aria-invalid={!!formState.fieldErrors?.companyName}
                />
                <FieldError errors={formState.fieldErrors?.companyName?.map((m) => ({ message: m }))} />
              </Field>

              <Field>
                <FieldLabel htmlFor='description'>
                  Beschreibung <span className='text-muted-foreground'>(optional)</span>
                </FieldLabel>
                <Textarea
                  id='description'
                  name='description'
                  placeholder='Kurze Beschreibung deines Unternehmens...'
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  rows={3}
                />
              </Field>

              <Button type='submit' className='w-full'>
                Weiter
              </Button>
            </FieldGroup>
          )}

          {step === 2 && (
            <FieldGroup>
              <div className='grid gap-4 sm:grid-cols-3'>
                <Field className='sm:col-span-2'>
                  <FieldLabel htmlFor='streetName'>
                    Straße <span className='text-destructive'>*</span>
                  </FieldLabel>
                  <Input
                    id='streetName'
                    name='streetName'
                    placeholder='Musterstraße'
                    value={formData.streetName}
                    onChange={(e) => updateField('streetName', e.target.value)}
                    aria-invalid={!!formState.fieldErrors?.streetName}
                  />
                  <FieldError errors={formState.fieldErrors?.streetName?.map((m) => ({ message: m }))} />
                </Field>

                <Field>
                  <FieldLabel htmlFor='streetNumber'>
                    Nr. <span className='text-destructive'>*</span>
                  </FieldLabel>
                  <Input
                    id='streetNumber'
                    name='streetNumber'
                    placeholder='123'
                    value={formData.streetNumber}
                    onChange={(e) => updateField('streetNumber', e.target.value)}
                    aria-invalid={!!formState.fieldErrors?.streetNumber}
                  />
                  <FieldError errors={formState.fieldErrors?.streetNumber?.map((m) => ({ message: m }))} />
                </Field>
              </div>

              <div className='grid gap-4 sm:grid-cols-3'>
                <Field>
                  <FieldLabel htmlFor='postCode'>
                    PLZ <span className='text-destructive'>*</span>
                  </FieldLabel>
                  <Input
                    id='postCode'
                    name='postCode'
                    placeholder='12345'
                    value={formData.postCode}
                    onChange={(e) => updateField('postCode', e.target.value)}
                    aria-invalid={!!formState.fieldErrors?.postCode}
                  />
                  <FieldError errors={formState.fieldErrors?.postCode?.map((m) => ({ message: m }))} />
                </Field>

                <Field className='sm:col-span-2'>
                  <FieldLabel htmlFor='city'>
                    Stadt <span className='text-destructive'>*</span>
                  </FieldLabel>
                  <Input
                    id='city'
                    name='city'
                    placeholder='Musterstadt'
                    value={formData.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    aria-invalid={!!formState.fieldErrors?.city}
                  />
                  <FieldError errors={formState.fieldErrors?.city?.map((m) => ({ message: m }))} />
                </Field>
              </div>

              <div className='grid gap-4 sm:grid-cols-2'>
                <Field>
                  <FieldLabel htmlFor='state'>
                    Bundesland <span className='text-muted-foreground'>(optional)</span>
                  </FieldLabel>
                  <Input
                    id='state'
                    name='state'
                    placeholder='Bayern'
                    value={formData.state}
                    onChange={(e) => updateField('state', e.target.value)}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor='country'>
                    Land <span className='text-destructive'>*</span>
                  </FieldLabel>
                  <Input
                    id='country'
                    name='country'
                    placeholder='Deutschland'
                    value={formData.country}
                    onChange={(e) => updateField('country', e.target.value)}
                    aria-invalid={!!formState.fieldErrors?.country}
                  />
                  <FieldError errors={formState.fieldErrors?.country?.map((m) => ({ message: m }))} />
                </Field>
              </div>

              <div className='flex gap-3'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setStep(1)}
                  className='flex-1'
                >
                  Zurück
                </Button>
                <Button type='submit' disabled={isPending} className='flex-1'>
                  {isPending ? (
                    <>
                      <IconLoader2 className='mr-2 size-4 animate-spin' />
                      Wird erstellt...
                    </>
                  ) : (
                    'Account erstellen'
                  )}
                </Button>
              </div>
            </FieldGroup>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
