# Generic Item API

> Version 1.4.0

Generic Item API


## Path Table

| Method | Path | Description |
| --- | --- | --- |
| GET | [/item-api/development/health-check](#getitem-apidevelopmenthealth-check) |  |
| GET | [/item-api/development/info](#getitem-apidevelopmentinfo) |  |
| GET | [/item-api/development/item/{name}](#getitem-apidevelopmentitemname) |  |
| POST | [/item-api/development/item/{name}](#postitem-apidevelopmentitemname) |  |
| GET | [/item-api/development/item/{name}/{id}](#getitem-apidevelopmentitemnameid) |  |
| PATCH | [/item-api/development/item/{name}/{id}](#patchitem-apidevelopmentitemnameid) |  |
| DELETE | [/item-api/development/item/{name}/{id}](#deleteitem-apidevelopmentitemnameid) |  |
| GET | [/item-api/development/my-item/{name}](#getitem-apidevelopmentmy-itemname) |  |
| POST | [/item-api/development/my-item/{name}](#postitem-apidevelopmentmy-itemname) |  |
| PATCH | [/item-api/development/my-item/{name}](#patchitem-apidevelopmentmy-itemname) |  |
| DELETE | [/item-api/development/my-item/{name}](#deleteitem-apidevelopmentmy-itemname) |  |
| POST | [/item-api/development/upload-file-url](#postitem-apidevelopmentupload-file-url) |  |

## Reference Table

| Name | Path | Description |
| --- | --- | --- |

## Path Details

***

### [GET]/item-api/development/health-check

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

### [GET]/item-api/development/info

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
    changelog: {
      version?: string
      features: {
        title?: string
        description?: string
      }[]
    }[]
  }
}
```

***

### [GET]/item-api/development/item/{name}

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

### [POST]/item-api/development/item/{name}

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

### [GET]/item-api/development/item/{name}/{id}

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

### [PATCH]/item-api/development/item/{name}/{id}

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

### [DELETE]/item-api/development/item/{name}/{id}

#### Responses

- 2XX Default Response

`application/json`

```typescript
```

***

### [GET]/item-api/development/my-item/{name}

#### Responses

- 2XX Default Response

`application/json`

```typescript
{
  name: string
  user_id?: string
  created_at?: number
  updated_at?: number
  created_at_iso?: string
  updated_at_iso?: string
}
```

***

### [POST]/item-api/development/my-item/{name}

#### Responses

- 2XX Default Response

`application/json`

```typescript
{
  name: string
  user_id?: string
  created_at?: number
  updated_at?: number
  created_at_iso?: string
  updated_at_iso?: string
}
```

***

### [PATCH]/item-api/development/my-item/{name}

#### Responses

- 2XX Default Response

`application/json`

```typescript
{
  name: string
  user_id?: string
  created_at?: number
  updated_at?: number
  created_at_iso?: string
  updated_at_iso?: string
}
```

***

### [DELETE]/item-api/development/my-item/{name}

#### Responses

- 2XX Default Response

`application/json`

```typescript
```

***

### [POST]/item-api/development/upload-file-url

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
