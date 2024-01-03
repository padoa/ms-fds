{{- define "ms-fds.env" -}}
- name: NODE_ENV
  value: {{ .Values.global.node_env }}
- name: SOCKET_IO_SERVER_IP
  value: sip-socketio.{{ .Values.global.namespace }}.svc.cluster.local
- name: STACK_NAME
  value: {{ .Values.global.stack_name }}
- name: CLIENT_NAME
  value: {{ .Values.global.client_name | quote }}
- name: CLIENT_GROUP
  value: {{ .Values.global.client_group | default "no_group"}}
- name: PROJECT
  value: {{ .Values.global.project }}
- name: ENV_NAME
  value: {{ .Values.global.env_name }}
- name: PADOA_ENDPOINT
  value: {{ .Values.global.clusterEndpoint }}
{{- $envArgs := dict "env" .Values.variables "Values" .Values "Template" .Template }}
{{- include "padoa.env" $envArgs }}
{{- range $name, $secretKey := .Values.secrets }}
- name: {{ $name }}
  valueFrom:
    secretKeyRef:
      name: main-secrets
      {{- if (hasPrefix "\"{{" ($secretKey | quote)) | and (hasSuffix "}}\"" ($secretKey | quote)) }}
      key: {{ tpl $secretKey $ }}
      {{- else }}
      key: {{ $secretKey | quote }}
      {{- end }}
{{- end }}
{{- $args := merge $ (dict "secrets" .Values.vault_secrets "name" (include "ms-fds.fullname" $) ) }}
{{- include "use_secrets" $args }}
{{- end }}
