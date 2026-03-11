# MCP Server README Writing Guide

Version: 1.0  
Purpose: Standardize README files for MCP servers in this monorepo.

This guide defines the best practices for writing README documentation
for Model Context Protocol (MCP) servers.

The objectives are:

1. Allow developers to quickly understand the purpose of the server
2. Provide clear installation and configuration instructions
3. Provide usage examples for rapid testing
4. Improve discoverability for search engines and AI crawlers
5. Ensure MCP registries can parse metadata automatically

---

# Monorepo Context

This repository contains multiple MCP servers.

Structure example:

/mcp-servers  
  /server-a  
  /server-b  
  /server-c  

Each server must have its own README file located at:

server-directory/README.md

Each README must follow the structure defined in this guide.

---

# Core Documentation Principles

## Clarity

A developer should understand what the server does within 10 seconds.

## Self-contained documentation

A developer should be able to:

- understand the server
- install it
- configure it
- run a test

without leaving the README page.

## AI-readable structure

Use structured sections and headings.

AI crawlers and registries rely on:

- headings
- lists
- code blocks
- examples

## Single Responsibility

Each MCP server should expose one clear capability.

Good examples:

Companies House MCP Server  
UK Parliament Members MCP Server  

Bad example:

UK Everything MCP Server

---

# Required README Structure

Every MCP server README must contain the following sections.

# Title
# Summary
## Features
## Available Tools
## Example Output
## Quick Start
## MCP Configuration
## Example Usage
## Use Cases
## Data Source
## Installation
## License
## MCP Metadata

---

# Section Writing Guide

## Title

Format:

[Data Source] MCP Server

Examples:

UK Parliament Members MCP Server  
Companies House MCP Server  
HMRC VAT MCP Server

The title must contain the keyword "MCP Server".

---

## Summary

The summary is critical for SEO and AI indexing.

Requirements:

- 3 to 5 lines
- explain the server purpose
- include keywords

Required keywords:

MCP server  
Model Context Protocol  
AI agents  
tools  
data access  

Example:

This MCP server provides structured access to UK Parliament Members
data using the Model Context Protocol.

It allows AI agents and developers to retrieve information about
Members of Parliament including constituencies, parties, and roles.

The server exposes multiple tools that can be used by AI assistants,
automation systems, and developer tooling.

---

## Features

List the main capabilities of the server.

Rules:

- bullet points
- one sentence per item

Example:

- Retrieve Members of the House of Commons
- Retrieve Members of the House of Lords
- Query members by constituency
- Retrieve parliamentary identifiers
- Access parliamentary metadata

---

## Available Tools

This section documents the MCP tools exposed by the server.

Each tool must include:

- tool name
- description
- parameters (optional)

Example:

### get_commons_members

Retrieve a list of Members of the House of Commons.

### get_member_by_id

Retrieve detailed information about a specific member.

Parameters:

memberId (string) – Parliament member identifier

---

## Example Output

Provide realistic output examples.

Example:

{
  "memberId": 1234,
  "name": "John Smith",
  "party": "Labour",
  "constituency": "Manchester Central"
}

This helps developers understand the schema.

---

## Quick Start

Allow users to run the server immediately.

Example:

Run using npx

npx @darkhorseone/mcp-server-uk-parliament-members

---

## MCP Configuration

Provide configuration examples for MCP clients.

Example:

{
  "mcpServers": {
    "uk-parliament-members": {
      "command": "npx",
      "args": ["-y", "@darkhorseone/mcp-server-uk-parliament-members"]
    }
  }
}

---

## Example Usage

Provide prompt examples.

Example:

List all Members of the UK House of Commons.

Find the Member of Parliament representing Oxford East.

Show details for MP with ID 1234.

---

## Use Cases

Describe scenarios where this MCP server is useful.

Example:

AI research agents

Political data analysis

Civic technology tools

AI assistants answering questions about UK politics

---

## Data Source

Always cite the official data source.

Example:

UK Parliament API  
https://developer.parliament.uk

This improves credibility and SEO authority.

---

## Installation

Example:

Run directly using npx

npx package-name

or

npm install  
npm run start

---

## License

Example:

MIT License

---

## MCP Metadata

Provide machine-readable metadata.

Example:

Protocol: Model Context Protocol

Transport: stdio

Tools:

get_commons_members  
get_lords_members  
get_member_by_id  

---

# SEO Optimization Guidelines

Each README should contain the following keywords 3–5 times:

MCP server  
Model Context Protocol  
AI agents  
tools  
API  

The first 500 characters should contain:

MCP  
AI agents  
data source  
tools  

This improves indexing by search engines and MCP directories.

---

# GitHub Discoverability

Add badges at the top of README.

Example:

![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-blue)

![AI Agent Ready](https://img.shields.io/badge/AI-Agent%20Ready-green)

Badges improve visibility and scanning.

---

# Quality Checklist

Before publishing a README verify:

Purpose explained in first paragraph  
Quick start works  
Tools documented  
Example output provided  
Configuration example included  
Data source cited  
Keywords included for SEO  

---

End of Guide