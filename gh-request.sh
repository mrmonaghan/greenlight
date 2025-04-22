#! /usr/bin/bash

payload=$(cat $1.json)
x_github_signature="sha1=51e79e6d9fb9ee2cd1cfe5512e6be1895f0a4e4a0"
x_github_signature_256="sha256=8227efb97b675a8c181c8b739243986ae9e6e84992bd2d8dc25323d44e55b9eb"
x_github_hook_id="536803644"
x_github_delivery="7658f172-17e1-11f0-99bf-9cc2c9685c12"
x_github_event=$1
github_user_agent="GitHub-Hookshot/959790a"

curl -v -X POST \
    -H "Content-Type: application/json" \
    -H "x-hub-signature: ${x_github_signature}" \
    -H "x-hub-signature-256: ${x_github_signature_256}" \
    -H "x-github-event: ${x_github_event}" \
    -H "x-github-delivery: ${x_github_delivery}" \
    -H "x-github-hook-id: ${x_github_hook_id}" \
    -H "User-Agent: ${github_user_agent}" \
    -d "${payload}" \
    $2
