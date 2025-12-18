<a name="top"></a>
# WAD continuous v1.0.0

Web Application Development, continuous version

# Table of contents

- [Authentication](#Authentication)
  - [Login user](#Login-user)
  - [Logout user](#Logout-user)
  - [Who am I](#Who-am-I)
- [Persons](#Persons)
  - [Adding new person](#Adding-new-person)
  - [Deleting existing person](#Deleting-existing-person)
  - [Modifying existing person](#Modifying-existing-person)
  - [Retrieving persons](#Retrieving-persons)
- [Teams](#Teams)
  - [Adding new team](#Adding-new-team)
  - [Deleting existing team](#Deleting-existing-team)
  - [Modyfing existing team](#Modyfing-existing-team)
  - [Retrieving teams](#Retrieving-teams)
- [Upload](#Upload)
  - [Upload file](#Upload-file)

___


# <a name='Authentication'></a> Authentication

## <a name='Login-user'></a> Login user
[Back to top](#top)

<p>Authenticates a user using JSON body credentials. The endpoint expects credentials formatted according to the JSON strategy of Passport (<code>{ &quot;username&quot;: &quot;...&quot;, &quot;password&quot;: &quot;...&quot; }</code>).</p>

```
POST /api/auth
```

### Request Body

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| username | `String` | <p>User's login name</p> |
| password | `String` | <p>User's password</p> |
### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| message | `String` | <p>Successful login message</p> |
| username | `String` | <p>Authenticated user's username</p> |
| roles | `Number[]` | <p>List of numeric role identifiers assigned to the user</p> |

### Error response

#### Error response - `401`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| Unauthorized |  | <p>Invalid credentials</p> |

#### Error response - `Error 4xx`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| code | `Number` | <p>Error code</p> |
| message | `String` | <p>Human-readable error message</p> |

## <a name='Logout-user'></a> Logout user
[Back to top](#top)

<p>Logs out the currently authenticated user by terminating their session.</p>

```
DELETE /api/auth
```
### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| message | `String` | <p>Logout confirmation message</p> |

### Error response

#### Error response - `Error 4xx`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| code | `Number` | <p>Error code</p> |
| message | `String` | <p>Human-readable error message</p> |

## <a name='Who-am-I'></a> Who am I
[Back to top](#top)

<p>Returns information about the currently authenticated user.<br> If no user is logged in, <code>username</code> and <code>roles</code> will be <code>null</code>.</p>

```
GET /api/auth
```
### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| username | `String|null` | <p>Authenticated user's username or null if not logged in</p> |
| roles | `Number[]|null` | <p>List of user's role IDs or null if not logged in</p> |

### Error response

#### Error response - `Error 4xx`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| code | `Number` | <p>Error code</p> |
| message | `String` | <p>Human-readable error message</p> |

# <a name='Persons'></a> Persons

## <a name='Adding-new-person'></a> Adding new person
[Back to top](#top)

```
POST /api/persons
```

### Request Body

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| firstname | `String` | <p>First name</p> |
| firstname | `String` | <p>Last name</p> |
| birthdate | `String` | <p>Birth date in any format which can be used as a parameter of Date() constructor</p> |
| email | `String` | <p>Email</p> |
| team_ids | `Number[]` | <p>Array of teams ids the person belongs to</p> |
### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `Number` | <p>Id of the just added person (automatically generated)</p> |
| firstname | `String` | <p>First name</p> |
| birthdate | `String` | <p>Birth date</p> |
| email | `String` | <p>Email</p> |

### Error response

#### Error response - `Error 4xx`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| code | `Number` | <p>Error code</p> |
| message | `String` | <p>Human-readable error message</p> |

## <a name='Deleting-existing-person'></a> Deleting existing person
[Back to top](#top)

```
DELETE /api/persons
```

### Query Parameters

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `Number` | <p>Id of the person to delete</p> |
### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `Number` | <p>Id of the just deleted person</p> |
| firstname | `String` | <p>First name of the person</p> |
| birthdate | `String` | <p>Birth date</p> |
| email | `String` | <p>Email</p> |

### Error response

#### Error response - `Error 4xx`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| code | `Number` | <p>Error code</p> |
| message | `String` | <p>Human-readable error message</p> |

## <a name='Modifying-existing-person'></a> Modifying existing person
[Back to top](#top)

```
PUT /api/persons
```

### Request Body

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `Number` | <p>Id of the person to modify</p> |
| firstname | `String` | <p>First name</p> |
| firstname | `String` | <p>Last name</p> |
| birthdate | `String` | <p>Birth date in any format which can be used as a parameter of Date() constructor</p> |
| email | `String` | <p>Email</p> |
| team_ids | `Number[]` | <p>Array of teams ids the person belongs to</p> |
### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `Number` | <p>Id of the modified person</p> |
| firstname | `String` | <p>First name</p> |
| birthdate | `String` | <p>Birth date</p> |
| email | `String` | <p>Email</p> |

### Error response

#### Error response - `Error 4xx`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| code | `Number` | <p>Error code</p> |
| message | `String` | <p>Human-readable error message</p> |

## <a name='Retrieving-persons'></a> Retrieving persons
[Back to top](#top)

```
GET /api/persons
```

### Query Parameters

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| q | `String` | **optional** <p>Filtering pattern (SQL style)</p> |
| sort | `Number` | **optional** <p>Column number to sort (negative - descending sort)</p>_Default value: 0_<br> |
| offset | `Number` | **optional** <p>Record number to start retrieving</p>_Default value: 0_<br> |
| limit | `Number` | **optional** <p>Limit of the records</p>_Default value: 10_<br> |
### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| total | `Number` | <p>Total number of persons</p> |
| filtered | `Number` | <p>Number of persons after filtering</p> |
| persons | `Object[]` | <p>List of person objects</p> |
| persons.id | `Number` | <p>Person ID</p> |
| persons.firstname | `String` | <p>First name</p> |
| persons.lastname | `String` | <p>Last name</p> |
| persons.birthdate | `Date` | <p>Birthdate</p> |
| persons.email | `String` | <p>Email</p> |
| persons.team_objects | `Object[]` | <p>List of team objects which the person belongs to</p> |
| persons.team_objects.id | `Number` | <p>Team ID</p> |
| persons.team_objects.name | `String` | <p>Team name</p> |
| persons.team_objects.longname | `String` | <p>Team long name</p> |
| persons.team_objects.color | `String` | <p>Team color (for background if no avatar)</p> |
| persons.team_objects.has_avatar | `Number` | <p>Team avatar uploaded (1 if yes)</p> |

### Error response

#### Error response - `Error 4xx`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| code | `Number` | <p>Error code</p> |
| message | `String` | <p>Human-readable error message</p> |

# <a name='Teams'></a> Teams

## <a name='Adding-new-team'></a> Adding new team
[Back to top](#top)

```
POST /api/teams
```

### Request Body

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| name | `String` | <p>Name of the team</p> |
| longname | `String` | <p>Long name of the team</p> |
| color | `String` | <p>HTML color name used to display the team chip</p> |
| has_avatar | `Number` | <p>1 if the team has avatar, 0 otherwise</p> |
### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `Number` | <p>Id of the just added team (automatically generated)</p> |
| name | `String` | <p>Name of the team</p> |
| longname | `String` | <p>Long name</p> |
| color | `String` | <p>HTML color name used to display the team chip</p> |
| has_avatar | `Number` | <p>1 if the team has avatar, 0 otherwise</p> |

### Error response

#### Error response - `Error 4xx`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| code | `Number` | <p>Error code</p> |
| message | `String` | <p>Human-readable error message</p> |

## <a name='Deleting-existing-team'></a> Deleting existing team
[Back to top](#top)

```
DELETE /api/teams
```

### Query Parameters

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `Number` | <p>Id of the team to delete</p> |
### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `Number` | <p>Id of the just deleted team</p> |
| name | `String` | <p>Its name</p> |
| longname | `String` | <p>Long name</p> |
| color | `String` | <p>Color</p> |
| has_avatar | `Number` | <p>If the team had an avatar</p> |

### Error response

#### Error response - `Error 4xx`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| code | `Number` | <p>Error code</p> |
| message | `String` | <p>Human-readable error message</p> |

## <a name='Modyfing-existing-team'></a> Modyfing existing team
[Back to top](#top)

```
PUT /api/teams
```

### Request Body

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `Number` | <p>Id of the team to modify</p> |
| name | `String` | <p>Name of the team</p> |
| longname | `String` | <p>Long name of the team</p> |
| color | `String` | <p>HTML color name used to display the team chip</p> |
| has_avatar | `Number` | <p>1 if the team has avatar, 0 otherwise</p> |
### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `Number` | <p>Id of the just modified team</p> |
| name | `String` | <p>Name of the team</p> |
| longname | `String` | <p>Long name</p> |
| color | `String` | <p>HTML color name used to display the team chip</p> |
| has_avatar | `Number` | <p>1 if the team has avatar, 0 otherwise</p> |

### Error response

#### Error response - `Error 4xx`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| code | `Number` | <p>Error code</p> |
| message | `String` | <p>Human-readable error message</p> |

## <a name='Retrieving-teams'></a> Retrieving teams
[Back to top](#top)

```
GET /api/teams
```

### Query Parameters

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| q | `String` | **optional** <p>Filtering pattern (SQL style)</p> |
| sort | `Number` | **optional** <p>Column number to sort (negative - descending sort)</p>_Default value: 0_<br> |
| offset | `Number` | **optional** <p>Record number to start retrieving</p>_Default value: 0_<br> |
| limit | `Number` | **optional** <p>Limit of the records</p>_Default value: 10_<br> |
### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| teams | `Object[]` | <p>Array of the teams</p> |
| teams.id | `Number` | <p>Team identifier</p> |
| teams.name | `String` | <p>Name of the team (short)</p> |
| teams.longname | `String` | <p>Long name of the team</p> |
| teams.color | `String` | <p>HTML color name used to display the team chip</p> |
| teams.has_avatar | `Number` | <p>1 if the team has avatar, 0 otherwise</p> |
| teams.member_count | `Number` | <p>Number of the team members</p> |

### Error response

#### Error response - `Error 4xx`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| code | `Number` | <p>Error code</p> |
| message | `String` | <p>Human-readable error message</p> |

# <a name='Upload'></a> Upload

## <a name='Upload-file'></a> Upload file
[Back to top](#top)

<p>Uploads one or more files using <code>multipart/form-data</code>. The request must be sent as form-data. Text fields will be available in <code>fields</code>, and uploaded files in <code>files</code>.</p>

```
POST /api/upload
```

### Request Body

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| file | `File` | <p>File to upload (can be multiple if form allows)</p> |
| description | `String` | **optional** <p>Optional description</p> |
### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| message | `String` | <p>Confirmation message</p> |
| file | `Object` | <p>Uploaded file information</p> |
| file.originalFilename | `String` | <p>Original name of the uploaded file</p> |
| file.newFilename | `String` | <p>New filename assigned by the server</p> |
| file.mimetype | `String` | <p>File MIME type</p> |
| file.size | `Number` | <p>File size in bytes</p> |
| file.filepath | `String` | <p>File path on server</p> |

### Error response

#### Error response - `Error 4xx`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| code | `Number` | <p>Error code</p> |
| message | `String` | <p>Human-readable error message</p> |

