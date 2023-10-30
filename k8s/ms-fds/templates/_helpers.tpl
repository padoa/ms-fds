{{- define "container-image" -}}
{{- printf "%s:%s" .Values.image.repository .Values.image.tag }}
{{- end -}}

{{/* Helper for postgres environment variables */}}
{{- define "pgtpl" }}
  {{- if kindIs "map" .item }}
  {{- tpl (toYaml .item) .ctx | nindent 2 }}
  {{- else }}
  {{- tpl (printf "value: '%v'" .item) .ctx | nindent 2 }}
  {{- end }}
{{- end }}

{{/* Hostname of the postgres database */}}
{{- define "postgresHost" -}}
{{ printf "%s.%s" (tpl .Values.postgres.name $) (.Values.postgres.endpoint) }}
{{- end -}}

{{/* Name of the secret for database credentials */}}
{{- define "postgresUserSecretName" -}}
{{- printf "%s-%s" .Release.Name .Values.postgres.user_secret.suffix -}}
{{- end -}}

{{/* Name of the secret for PKI */}}
{{- define "postgresPKISecretName" -}}
{{- printf "%s-%s" .Release.Name .Values.postgres.pki_secret.suffix -}}
{{- end -}}

{{- define "PKIVolumeMount" -}}
- name: pgsslcert
  mountPath: /pgsslcert/
  readOnly: true
{{- end -}}

{{- define "PKIVolume" -}}
- name: pgsslcert
  secret:
    secretName: {{ include "postgresPKISecretName" . }}
    defaultMode: 416
{{- end -}}

{{- define "environment" }}
{{- range $name, $value := .Values.variables }}
- name: {{ $name }}
  value: {{ tpl $value $ }}
{{- end }}
{{- if .Values.postgres.pgoEnabled }}
{{- with .Values.postgres }}
- name: PGHOST
  {{- include "pgtpl" (dict "ctx" $ "item" .host) }}
- name: PGPORT
  {{- include "pgtpl" (dict "ctx" $ "item" .port) }}
- name: PGUSER
  {{- include "pgtpl" (dict "ctx" $ "item" .username) }}
- name: PGPASSWORD
  {{- include "pgtpl" (dict "ctx" $ "item" .password) }}
{{- end }}
{{- if .Values.postgres.pki_secret.enabled }}
- name: PGSSLMODE
  {{- include "pgtpl" (dict "ctx" $ "item" .Values.postgres.sslmode) }}
- name: PGSSLREJECTUNAUTHORIZED
  {{- include "pgtpl" (dict "ctx" $ "item" .Values.postgres.rejectUnauthorized) }}
- name: PGSSLROOTCERT
  value: /pgsslcert/issuing_ca
- name: PGSSLCERT
  value: /pgsslcert/certificate
- name: PGSSLKEY
  value: /pgsslcert/private_key
{{- end }}
{{- else }}
{{- $args := merge (deepCopy $) (dict "secrets" .Values.postgres.legacySecrets "name" "sape-api" ) }}
{{- include "use_secrets" $args }}
{{- end }}
{{- $args := merge (deepCopy $) (dict "secrets" .Values.vaultSecrets "name" "sape-api" ) }}
{{- include "use_secrets" $args }}
{{- end }}
