# Generic Item API

> Version 1.3.0

Generic Item API

## Path Table

| Method | Path | Description |
| --- | --- | --- |
| GET | [/item-api/health-check](#getitem-apihealth-check) |  |
| GET | [/item-api/info](#getitem-apiinfo) |  |
| GET | [/item-api/item/{name}](#getitem-apiitemname) |  |
| POST | [/item-api/item/{name}](#postitem-apiitemname) |  |
| GET | [/item-api/item/{name}/{id}](#getitem-apiitemnameid) |  |
| PATCH | [/item-api/item/{name}/{id}](#patchitem-apiitemnameid) |  |
| DELETE | [/item-api/item/{name}/{id}](#deleteitem-apiitemnameid) |  |
| GET | [/item-api/my-item/{name}](#getitem-apimy-itemname) |  |
| POST | [/item-api/my-item/{name}](#postitem-apimy-itemname) |  |
| PATCH | [/item-api/my-item/{name}](#patchitem-apimy-itemname) |  |
| DELETE | [/item-api/my-item/{name}](#deleteitem-apimy-itemname) |  |
| POST | [/item-api/upload-file-url](#postitem-apiupload-file-url) |  |

## Reference Table

| Name | Path | Description |
| --- | --- | --- |

## Path Details

***

### [GET]/item-api/health-check

#### Responses

- 200 Default Response

`application/json`

```typescript
{
  status: {
    access?: string
    iam?: string
  }
  version?: string
  date?: string
}
```

***

### [GET]/item-api/info

#### Responses

- 200 Default Response

`application/json`

```typescript
{
  info: {
    name?: string
    version?: string
    copyright?: string
    date?: string
  }
}
```

***

### [GET]/item-api/item/{name}

#### Parameters(Query)

```typescript
_continuation?: string
```

```typescript
_order?: string
```

#### Responses

- 2XX Default Response

`application/json`

```typescript
{
  results: {
    id: string
    name: string
    user_id?: string
    created_at?: number
    updated_at?: number
    created_at_iso?: string
    updated_at_iso?: string
  }[]
  continuation?: string
}
```

***

### [POST]/item-api/item/{name}

#### Responses

- 2XX Default Response

`application/json`

```typescript
{
  id: string
  name: string
  user_id?: string
  created_at?: number
  updated_at?: number
  created_at_iso?: string
  updated_at_iso?: string
}
```

***

### [GET]/item-api/item/{name}/{id}

#### Responses

- 2XX Default Response

`application/json`

```typescript
{
  id: string
  name: string
  user_id?: string
  created_at?: number
  updated_at?: number
  created_at_iso?: string
  updated_at_iso?: string
}
```

***

### [PATCH]/item-api/item/{name}/{id}

#### Responses

- 2XX Default Response

`application/json`

```typescript
{
  id: string
  name: string
  user_id?: string
  created_at?: number
  updated_at?: number
  created_at_iso?: string
  updated_at_iso?: string
}
```

***

### [DELETE]/item-api/item/{name}/{id}

#### Responses

- 2XX Default Response

`application/json`

```typescript
{}
```

***

### [GET]/item-api/my-item/{name}

#### Responses

- 2XX Default Response

`application/json`

```typescript
{
  name: string
  user_id?: string
  created_at?: number
  updated_at?: number
}
```

***

### [POST]/item-api/my-item/{name}

#### Responses

- 2XX Default Response

`application/json`

```typescript
{
  name: string
  user_id?: string
  created_at?: number
  updated_at?: number
}
```

***

### [PATCH]/item-api/my-item/{name}

#### Responses

- 2XX Default Response

`application/json`

```typescript
{
  name: string
  user_id?: string
  created_at?: number
  updated_at?: number
}
```

***

### [DELETE]/item-api/my-item/{name}

#### Responses

- 2XX Default Response

`application/json`

```typescript
{}
```

***

### [POST]/item-api/upload-file-url

#### RequestBody

- application/json

```typescript
{
  path: string
  filename: string
  content_type: string
}
```

#### Responses

- 200 Default Response

`application/json`

```typescript
{
  download_file_url?: string
  upload_file_url: string
  ttl: number
}
```

## References
