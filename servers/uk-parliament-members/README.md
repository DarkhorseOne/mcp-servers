![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-blue)
![AI Agent Ready](https://img.shields.io/badge/AI-Agent%20Ready-green)

# UK Parliament Members MCP Server

# Summary
This MCP server provides structured access to UK Parliament Members data using the Model Context Protocol.
It enables AI agents to query members, constituencies, parties, posts, and reference data through API-backed tools and data access.
Developers can integrate the MCP server via stdio transport to retrieve member profiles, biographies, votes, and related metadata.
The server exposes tools that map directly to the Members API for consistent automation and AI agents workflows.

## Features
- Search current and historical members with filters for house, party, and constituency.
- Retrieve member profiles, biographies, contact details, votes, and written questions.
- Access constituency data, election results, and geographic metadata.
- Query party, post, and reference datasets for policy and department lookups.

## Available Tools
### ukp_location_browse
Returns a list of locations, both parent and child.

Parameters:
- locationType (number, path)
- locationName (string, path)

### ukp_location_constituency_search
Returns a list of constituencies.

Parameters:
- searchText (string, query)
- skip (number, query)
- take (number, query)

### ukp_location_constituency
Returns a constituency by ID.

Parameters:
- id (number, path)

### ukp_location_constituency_synopsis
Returns a synopsis by constituency ID.

Parameters:
- id (number, path)

### ukp_location_constituency_representations
Returns a list of representations by constituency ID.

Parameters:
- id (number, path)

### ukp_location_constituency_geometry
Returns geometry by constituency ID.

Parameters:
- id (number, path)

### ukp_location_constituency_election_results
Returns a list of election results by constituency ID.

Parameters:
- id (number, path)

### ukp_location_constituency_election_result
Returns an election result by constituency and election id.

Parameters:
- id (number, path)
- electionId (number, path)

### ukp_location_constituency_election_result_latest
Returns latest election result by constituency id.

Parameters:
- id (number, path)

### ukp_lords_interests_register
Returns a list of registered interests.

Parameters:
- searchTerm (string, query)
- page (number, query)
- includeDeleted (boolean, query)

### ukp_lords_interests_staff
Returns a list of staff.

Parameters:
- searchTerm (string, query)
- page (number, query)

### ukp_members_search
Returns a list of current members of the Commons or Lords.

Parameters:
- Name (string, query)
- Location (string, query)
- PostTitle (string, query)
- PartyId (number, query)
- House (number, query)
- ConstituencyId (number, query)
- NameStartsWith (string, query)
- Gender (string, query)
- MembershipStartedSince (string, query)
- MembershipEnded.MembershipEndedSince (string, query)
- MembershipEnded.MembershipEndReasonIds (array:number, query)
- MembershipEnded.MembershipEndResignedTypes (array:number, query)
- MembershipEnded.MembershipEndEndDates (array:string, query)
- MembershipEnded.MembershipEndResignedDates (array:string, query)
- MembershipEnded.MembershipEndDeathDates (array:string, query)
- MembershipEnded.MembershipEndDisqualifiedDates (array:string, query)
- MembershipEnded.MembershipEndEndReasonIds (array:number, query)
- MembershipEnded.MembershipEndOtherReasonIds (array:number, query)
- MembershipEnded.MembershipEndParliamentDissolvedDates (array:string, query)
- Skip (number, query)
- Take (number, query)

### ukp_members_search_historical
Returns a list of members of the Commons or Lords.

Parameters:
- name (string, query)
- dateToSearchFor (string, query)
- skip (number, query)
- take (number, query)

### ukp_members_get_by_id
Return member by ID.

Parameters:
- id (number, path)
- detailsForDate (string, query)

### ukp_members_biography
Return biography of member by ID.

Parameters:
- id (number, path)

### ukp_members_contact
Return list of contact details of member by ID.

Parameters:
- id (number, path)

### ukp_members_contribution_summary
Return contribution summary of member by ID.

Parameters:
- id (number, path)
- page (number, query)

### ukp_members_edms
Return list of early day motions of member by ID.

Parameters:
- id (number, path)
- page (number, query)

### ukp_members_experience
Return experience of member by ID.

Parameters:
- id (number, path)

### ukp_members_focus
Return list of areas of focus of member by ID.

Parameters:
- id (number, path)

### ukp_members_history
Return members by ID with list of their historical names, parties and memberships.

Parameters:
- ids (array:number, query)

### ukp_members_latest_election_result
Return latest election result of member by ID.

Parameters:
- id (number, path)

### ukp_members_portrait
Return portrait of member by ID.

Parameters:
- id (number, path)
- cropType (number, query)
- webVersion (boolean, query)

### ukp_members_portrait_url
Return portrait url of member by ID.

Parameters:
- id (number, path)

### ukp_members_registered_interests
Return list of registered interests of member by ID.

Parameters:
- id (number, path)
- house (number, query)

### ukp_members_staff
Return list of staff of member by ID.

Parameters:
- id (number, path)

### ukp_members_synopsis
Return synopsis of member by ID.

Parameters:
- id (number, path)

### ukp_members_thumbnail
Return thumbnail of member by ID.

Parameters:
- id (number, path)

### ukp_members_thumbnail_url
Return thumbnail url of member by ID.

Parameters:
- id (number, path)

### ukp_members_voting
Return list of votes by member by ID.

Parameters:
- id (number, path)
- house (number, query)
- page (number, query)

### ukp_members_written_questions
Return list of written questions by member by ID.

Parameters:
- id (number, path)
- page (number, query)

### ukp_parties_state_of_the_parties
Returns current state of parties.

Parameters:
- house (number, path)
- forDate (string, path)

### ukp_parties_lords_by_type
Returns the composition of the House of Lords by peerage type.

Parameters:
- forDate (string, path)

### ukp_parties_get_active
Returns a list of current parties with at least one active member.

Parameters:
- house (number, path)

### ukp_posts_government_posts
Returns a list of government posts.

Parameters:
- departmentId (number, query)

### ukp_posts_opposition_posts
Returns a list of opposition posts.

Parameters:
- departmentId (number, query)

### ukp_posts_spokespersons
Returns a list of spokespersons.

Parameters:
- partyId (number, query)

### ukp_posts_departments
Returns a list of departments.

Parameters:
- type (number, path)

### ukp_posts_speaker_and_deputies
Returns a list containing the speaker and deputy speakers.

Parameters:
- forDate (string, path)

### ukp_reference_policy_interests
Returns a list of policy interest.

### ukp_reference_departments
Returns a list of departments.

Parameters:
- id (number, query)
- nameContains (string, query)

### ukp_reference_answering_bodies
Returns a list of answering bodies.

Parameters:
- id (number, query)
- nameContains (string, query)

### ukp_reference_departments_logo
Returns department logo.

Parameters:
- id (number, path)

## Example Output
```json
{
  "status": 200,
  "data": {
    "items": [
      {
        "memberId": 1,
        "name": "Jane Doe",
        "house": "Commons",
        "party": "Example Party"
      }
    ],
    "totalResults": 1
  },
  "upstream_path": "/api/Members/Search",
  "retrieved_at": "2026-03-11T10:00:00.000Z"
}
```

## Quick Start
Run the MCP server using npx:

```bash
npx -y -p @darkhorseone/mcp-server-uk-parliament-members mcp-server-uk-parliament-members
```

## MCP Configuration
Example `mcpServers` configuration for stdio transport:

```json
{
  "mcpServers": {
    "uk-parliament-members": {
      "command": "npx",
      "args": ["-y", "-p", "@darkhorseone/mcp-server-uk-parliament-members", "mcp-server-uk-parliament-members"],
      "env": {
        "UKP_API_BASE_URL": "https://members-api.parliament.uk",
        "UKP_REQUEST_TIMEOUT_MS": "10000"
      }
    }
  }
}
```

## Example Usage
- Search current members by name and constituency.
- Fetch a member biography and contact details by ID.
- Retrieve constituency election results and geometry.
- List active parties and government posts.

## Use Cases
- AI agents answering questions about MPs and Lords with authoritative data.
- Research tools tracking member roles, voting, and parliamentary history.
- Civic technology platforms enriching datasets with constituency metadata.
- Automation workflows collecting reference data for policy analysis.

## Data Source
UK Parliament Members API
https://members-api.parliament.uk/index.html

## Installation
Run directly using npx:

```bash
npx -y -p @darkhorseone/mcp-server-uk-parliament-members mcp-server-uk-parliament-members
```

Or install via pnpm from the repository root:

```bash
pnpm install
```

## Run (HTTP proxy server)
Build first, then start:

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-members run build
pnpm --filter @darkhorseone/mcp-server-uk-parliament-members run start:http
```

Set a custom HTTP port with the `UKP_HTTP_PORT` environment variable (default: `8787`):

```bash
UKP_HTTP_PORT=8787 pnpm --filter @darkhorseone/mcp-server-uk-parliament-members run start:http
```

Published package command:

```bash
npx -y -p @darkhorseone/mcp-server-uk-parliament-members -- mcp-server-uk-parliament-members-http
```

If your shell cannot resolve the bin ("command not found"), run the HTTP entrypoint directly:

```bash
npx -y -p @darkhorseone/mcp-server-uk-parliament-members -- node ./dist/http.js
```

Health check:

```bash
curl http://127.0.0.1:8787/healthz
```

Proxy pattern:

```text
GET /proxy/<upstream-path>?<query>
```

Example:

```bash
curl "http://127.0.0.1:8787/proxy/api/Members/History?ids=1&ids=2"
```

## License
MIT License

## MCP Metadata
Protocol: Model Context Protocol
Transport: stdio
Tools: ukp_location_browse, ukp_location_constituency_search, ukp_location_constituency, ukp_location_constituency_synopsis, ukp_location_constituency_representations, ukp_location_constituency_geometry, ukp_location_constituency_election_results, ukp_location_constituency_election_result, ukp_location_constituency_election_result_latest, ukp_lords_interests_register, ukp_lords_interests_staff, ukp_members_search, ukp_members_search_historical, ukp_members_get_by_id, ukp_members_biography, ukp_members_contact, ukp_members_contribution_summary, ukp_members_edms, ukp_members_experience, ukp_members_focus, ukp_members_history, ukp_members_latest_election_result, ukp_members_portrait, ukp_members_portrait_url, ukp_members_registered_interests, ukp_members_staff, ukp_members_synopsis, ukp_members_thumbnail, ukp_members_thumbnail_url, ukp_members_voting, ukp_members_written_questions, ukp_parties_state_of_the_parties, ukp_parties_lords_by_type, ukp_parties_get_active, ukp_posts_government_posts, ukp_posts_opposition_posts, ukp_posts_spokespersons, ukp_posts_departments, ukp_posts_speaker_and_deputies, ukp_reference_policy_interests, ukp_reference_departments, ukp_reference_answering_bodies, ukp_reference_departments_logo
