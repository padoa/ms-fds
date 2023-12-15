export const CUSTOM_HAZARDS_REGEX = ['h\\s*350i', 'h\\s*360f[d]?', 'h\\s*360d[f]?', 'h\\s*361f[d]?', 'h\\s*361d'];

export const HAZARDS_REGEX = `(?<!eu)((${CUSTOM_HAZARDS_REGEX.join(')|(')})|(h\\s*[2-4]\\d{2}))`;
export const PRECAUTION_REGEX = '(((p\\s*[1-5]\\d{2})\\s*\\+?\\s*)+)';
export const EUROPEAN_HAZARDS_REGEX = '(euh\\s*[02]\\d{2})|(euh\\s*401)';
