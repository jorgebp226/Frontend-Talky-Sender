/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/


/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	STRIPE_SECRET_KEY
	STRIPE_PUBLISH_KEY
	STRIPE_WEBHOOK_SECRET
Amplify Params - DO NOT EDIT */


const express = require('express');
const serverless = require('serverless-http');
const app = express();

// Importa tu servidor
const server = require('./server');

// Usa el servidor configurado en server.js
app.use('/api', server);

// Exporta el handler de serverless
module.exports.handler = serverless(app);
