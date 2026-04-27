'use server';

interface CreateTenantInput {
  tenant: {
    companyName: string;
    description?: string;
  };
  address: {
    streetName: string;
    streetNumber: string;
    postCode: string;
    city: string;
    state: string;
    country: string;
  };
}

interface CreateTenantResult {
  success: boolean;
  error?: string;
  data?: {
    tenantId: string;
    subdomain: string;
  };
}

export async function createTenant(
  input: CreateTenantInput,
): Promise<CreateTenantResult> {
  try {
    const apiUrl = process.env.API_URL || 'http://localhost:3001';

    const response = await fetch(`${apiUrl}/tenant/createNew`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error:
          errorData.message ||
          `Fehler beim Erstellen des Accounts (${response.status})`,
      };
    }

    const data = await response.json();

    return {
      success: true,
      data: {
        tenantId: data.tenantId,
        subdomain: data.subdomain,
      },
    };
  } catch (error) {
    console.error('Error creating tenant:', error);
    return {
      success: false,
      error:
        'Verbindung zum Server fehlgeschlagen. Bitte versuche es später erneut.',
    };
  }
}
