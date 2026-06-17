import { Type } from "typebox";
import { buildTool, jsonStringToValue, cleanUndefined } from "./shared.js";

export function securityTools(client) {
  return [
    buildTool(client, {
      name: "elasticsearch_security_authenticate",
      label: "Authenticate Current User",
      description: "Return the currently authenticated user and effective authentication details.",
      parameters: Type.Object({}),
      progress: "Authenticating current user...",
      run: async () => await client.request({ method: "GET", path: "/_security/_authenticate" }),
    }),
    buildTool(client, {
      name: "elasticsearch_security_get_user",
      label: "Get User",
      description: "Get one or more security users.",
      parameters: Type.Object({
        username: Type.Optional(Type.String({ description: "Optional username or comma-separated usernames" })),
      }),
      progress: (params) => `Fetching user${params.username ? ` ${params.username}` : "s"}...`,
      run: async ({ params }) => await client.request({
        method: "GET",
        path: params.username ? `/_security/user/${encodeURIComponent(params.username)}` : "/_security/user",
      }),
    }),
    buildTool(client, {
      name: "elasticsearch_security_put_user",
      label: "Put User",
      description: "Create or update a security user.",
      parameters: Type.Object({
        username: Type.String({ description: "Username" }),
        body: Type.String({ description: "User body as a JSON object string" }),
      }),
      progress: (params) => `Upserting user ${params.username}...`,
      run: async ({ params }) => await client.request({
        method: "PUT",
        path: `/_security/user/${encodeURIComponent(params.username)}`,
        body: jsonStringToValue(params.body, "body", { required: true, expect: "object" }),
      }),
    }),
    buildTool(client, {
      name: "elasticsearch_security_delete_user",
      label: "Delete User",
      description: "Delete a security user.",
      parameters: Type.Object({
        username: Type.String({ description: "Username" }),
      }),
      progress: (params) => `Deleting user ${params.username}...`,
      run: async ({ params }) => await client.request({ method: "DELETE", path: `/_security/user/${encodeURIComponent(params.username)}` }),
    }),
    buildTool(client, {
      name: "elasticsearch_security_get_role",
      label: "Get Role",
      description: "Get one or more security roles.",
      parameters: Type.Object({
        name: Type.Optional(Type.String({ description: "Optional role name or comma-separated role names" })),
      }),
      progress: (params) => `Fetching role${params.name ? ` ${params.name}` : "s"}...`,
      run: async ({ params }) => await client.request({
        method: "GET",
        path: params.name ? `/_security/role/${encodeURIComponent(params.name)}` : "/_security/role",
      }),
    }),
    buildTool(client, {
      name: "elasticsearch_security_put_role",
      label: "Put Role",
      description: "Create or update a security role.",
      parameters: Type.Object({
        name: Type.String({ description: "Role name" }),
        body: Type.String({ description: "Role body as a JSON object string" }),
      }),
      progress: (params) => `Upserting role ${params.name}...`,
      run: async ({ params }) => await client.request({
        method: "PUT",
        path: `/_security/role/${encodeURIComponent(params.name)}`,
        body: jsonStringToValue(params.body, "body", { required: true, expect: "object" }),
      }),
    }),
    buildTool(client, {
      name: "elasticsearch_security_delete_role",
      label: "Delete Role",
      description: "Delete a security role.",
      parameters: Type.Object({
        name: Type.String({ description: "Role name" }),
      }),
      progress: (params) => `Deleting role ${params.name}...`,
      run: async ({ params }) => await client.request({ method: "DELETE", path: `/_security/role/${encodeURIComponent(params.name)}` }),
    }),
    buildTool(client, {
      name: "elasticsearch_security_create_api_key",
      label: "Create API Key",
      description: "Create an Elasticsearch API key.",
      parameters: Type.Object({
        body: Type.String({ description: "API key request body as a JSON object string" }),
      }),
      progress: "Creating API key...",
      run: async ({ params }) => await client.request({
        method: "POST",
        path: "/_security/api_key",
        body: jsonStringToValue(params.body, "body", { required: true, expect: "object" }),
      }),
    }),
    buildTool(client, {
      name: "elasticsearch_security_get_api_key",
      label: "Get API Keys",
      description: "Get API keys by id, name, owner, or principal filters.",
      parameters: Type.Object({
        id: Type.Optional(Type.String({ description: "Optional API key id" })),
        name: Type.Optional(Type.String({ description: "Optional API key name" })),
        realm_name: Type.Optional(Type.String({ description: "Optional realm name filter" })),
        username: Type.Optional(Type.String({ description: "Optional username filter" })),
        owner: Type.Optional(Type.Boolean({ description: "Whether to return only keys owned by the current authenticated user" })),
      }),
      progress: "Fetching API keys...",
      run: async ({ params }) => await client.request({
        method: "GET",
        path: "/_security/api_key",
        query: cleanUndefined({
          id: params.id,
          name: params.name,
          realm_name: params.realm_name,
          username: params.username,
          owner: params.owner,
        }),
      }),
    }),
    buildTool(client, {
      name: "elasticsearch_security_invalidate_api_key",
      label: "Invalidate API Key",
      description: "Invalidate API keys using the official invalidate request body.",
      parameters: Type.Object({
        body: Type.String({ description: "Invalidate API key request body as a JSON object string" }),
      }),
      progress: "Invalidating API key(s)...",
      run: async ({ params }) => await client.request({
        method: "DELETE",
        path: "/_security/api_key",
        body: jsonStringToValue(params.body, "body", { required: true, expect: "object" }),
      }),
    }),
  ];
}
