export function formDataToPartial(formData: FormData) {
  const data: Record<string, any> = {};
  for (const [key, value] of formData.entries()) {
    if (key in data) {
      data[key] = Array.isArray(data[key])
        ? [...data[key], value]
        : [data[key], value];
    } else {
      data[key] = value;
    }
  }
  return data;
}

export function getChangedFormData(
  current: Record<string, any>,
  formData: FormData
) {
  const partial = formDataToPartial(formData);
  const changed: Record<string, any> = {};

  for (const [key, value] of Object.entries(partial)) {
    const a = current[key];

    // Vergleich robuster (stringify primitive; arrays als join; objects als JSON)
    const norm = (v: any) => {
      if (v === null || v === undefined) return '';
      if (Array.isArray(v)) return v.map(String).join('|');
      if (typeof v === 'object') return JSON.stringify(v);
      return String(v);
    };

    if (norm(a) !== norm(value)) changed[key] = value;
  }

  return changed;
}
