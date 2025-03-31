# Real Talk Video Compiler Guidelines

## Commands
### Backend
- **Build**: `npm run build` - Compiles TypeScript code using tsc
- **Dev**: `npm run dev` - Runs server with hot-reload using nodemon
- **Start**: `npm run start` - Runs the compiled server
- **Test**: Use `npm test` - *Note: Tests need to be implemented with Jest*

### Frontend (in src/frontend directory)
- **Start Dev Server**: `cd src/frontend && npm start`
- **Build Frontend**: `cd src/frontend && npm run build`
- **Test React**: `cd src/frontend && npm test` - Runs React component tests
- **Test Specific File**: `cd src/frontend && npm test -- ComponentName.test.tsx`

## Style Guidelines
- **Imports**: Order by: (1) built-ins (2) external packages (3) local modules
- **Formatting**: 2-space indentation, semicolons, double quotes for strings
- **Types**: Use explicit TypeScript types, avoid `any`, prefer interfaces for objects
- **Components**: Use functional React components with TypeScript interfaces for props
- **Naming**: camelCase for variables/functions, PascalCase for components/interfaces
- **Error Handling**: Use try/catch for async operations with proper error states
- **CSS**: Use component-scoped CSS files, follow BEM naming for classes
- **Supabase**: Use environment variables for credentials (.env files)

## Architecture 
- **Backend**: Express API with controllers, routes, and services
- **Frontend**: React with components, pages, and utility structure
- **Database**: Supabase with clients in `src/backend/config/supabase.ts` and `src/frontend/src/utils/supabase.ts`