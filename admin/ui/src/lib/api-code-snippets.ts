// Utility functions for generating API code snippets in different languages

export interface CodeSnippets {
  cURL: string
  JavaScript: string
  Python: string
  PHP: string
}

export const generateTokenCodeSnippets = (
  siteUrl: string,
  username: string,
  password: string
): CodeSnippets => {
  const fullUrl = `${siteUrl}/wp-json/jwt-auth/v1/token`
  const body = `{ "username": "${username}", "password": "${password}" }`

  return {
    cURL: `curl -X POST ${fullUrl} \\
-H 'Content-Type: application/json' \\
-d '${body}'`,
    JavaScript: `const options = {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(${body})
};

fetch('${fullUrl}', options)
  .then(response => response.json())
  .then(response => console.log(response))
  .catch(err => console.error(err));`,
    Python: `import requests
import json

url = "${fullUrl}"
payload = json.dumps(${body.replace(/"/g, `"`).replace(/: "/g, `: "`).replace(/", "/g, `", "`)})
headers = {
  'Content-Type': 'application/json'
}

response = requests.request("POST", url, headers=headers, data=payload)

print(response.text)`,
    PHP: `<?php

$url = '${fullUrl}';
$data = ${body};

$options = array(
    'http' => array(
        'header' => "Content-type: application/json\\r\\n",
        'method' => 'POST',
        'content' => $data
    )
);

$context = stream_context_create($options);
$result = file_get_contents($url, false, $context);

if ($result === FALSE) {
    die('Error occurred');
}

echo $result;`,
  }
}

export const generateValidateCodeSnippets = (siteUrl: string, token: string): CodeSnippets => {
  const fullUrl = `${siteUrl}/wp-json/jwt-auth/v1/token/validate`

  return {
    cURL: `curl -X POST ${fullUrl} \\
-H 'Content-Type: application/json' \\
-H 'Authorization: Bearer ${token}' \\
-d '{}'`,
    JavaScript: `const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ${token}'
  },
  body: JSON.stringify({})
};

fetch('${fullUrl}', options)
  .then(response => response.json())
  .then(response => console.log(response))
  .catch(err => console.error(err));`,
    Python: `import requests
import json

url = "${fullUrl}"
headers = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer ${token}'
}

response = requests.request("POST", url, headers=headers, data=json.dumps({}))

print(response.text)`,
    PHP: `<?php

$url = '${fullUrl}';

$options = array(
    'http' => array(
        'header' => "Content-type: application/json\\r\\n" .
                   "Authorization: Bearer ${token}\\r\\n",
        'method' => 'POST',
        'content' => '{}'
    )
);

$context = stream_context_create($options);
$result = file_get_contents($url, false, $context);

if ($result === FALSE) {
    die('Error occurred');
}

echo $result;`,
  }
}

export const getCodeSnippets = (
  endpoint: string,
  siteUrl: string,
  username: string,
  password: string,
  token: string
): CodeSnippets => {
  if (endpoint === '/jwt-auth/v1/token') {
    return generateTokenCodeSnippets(siteUrl, username, password)
  } else {
    return generateValidateCodeSnippets(siteUrl, token)
  }
}
