import * as Types from './operations';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const ProcessQueryDocument = gql`
    mutation processQuery($input: QueryRequestInput!) {
  processQuery(input: $input) {
    threadId
    connectionId
  }
}
    `;
export type ProcessQueryMutationFn = Apollo.MutationFunction<Types.ProcessQueryMutation, Types.ProcessQueryMutationVariables>;

/**
 * __useProcessQueryMutation__
 *
 * To run a mutation, you first call `useProcessQueryMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useProcessQueryMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [processQueryMutation, { data, loading, error }] = useProcessQueryMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useProcessQueryMutation(baseOptions?: Apollo.MutationHookOptions<Types.ProcessQueryMutation, Types.ProcessQueryMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.ProcessQueryMutation, Types.ProcessQueryMutationVariables>(ProcessQueryDocument, options);
      }
export type ProcessQueryMutationHookResult = ReturnType<typeof useProcessQueryMutation>;
export type ProcessQueryMutationResult = Apollo.MutationResult<Types.ProcessQueryMutation>;
export type ProcessQueryMutationOptions = Apollo.BaseMutationOptions<Types.ProcessQueryMutation, Types.ProcessQueryMutationVariables>;
export const RateQueryResultDocument = gql`
    mutation rateQueryResult($threadId: String!, $interactionId: String!, $isHelpful: Boolean!, $feedback: String) {
  rateQueryResult(
    threadId: $threadId
    interactionId: $interactionId
    isHelpful: $isHelpful
    feedback: $feedback
  )
}
    `;
export type RateQueryResultMutationFn = Apollo.MutationFunction<Types.RateQueryResultMutation, Types.RateQueryResultMutationVariables>;

/**
 * __useRateQueryResultMutation__
 *
 * To run a mutation, you first call `useRateQueryResultMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRateQueryResultMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [rateQueryResultMutation, { data, loading, error }] = useRateQueryResultMutation({
 *   variables: {
 *      threadId: // value for 'threadId'
 *      interactionId: // value for 'interactionId'
 *      isHelpful: // value for 'isHelpful'
 *      feedback: // value for 'feedback'
 *   },
 * });
 */
export function useRateQueryResultMutation(baseOptions?: Apollo.MutationHookOptions<Types.RateQueryResultMutation, Types.RateQueryResultMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.RateQueryResultMutation, Types.RateQueryResultMutationVariables>(RateQueryResultDocument, options);
      }
export type RateQueryResultMutationHookResult = ReturnType<typeof useRateQueryResultMutation>;
export type RateQueryResultMutationResult = Apollo.MutationResult<Types.RateQueryResultMutation>;
export type RateQueryResultMutationOptions = Apollo.BaseMutationOptions<Types.RateQueryResultMutation, Types.RateQueryResultMutationVariables>;
export const CreateConnectionDocument = gql`
    mutation createConnection($createConnectionInput: CreateConnectionDto!) {
  createConnection(createConnectionInput: $createConnectionInput) {
    _id
    name
    description
    type
    host
    port
    database
    username
    isActive
    createdAt
    updatedAt
  }
}
    `;
export type CreateConnectionMutationFn = Apollo.MutationFunction<Types.CreateConnectionMutation, Types.CreateConnectionMutationVariables>;

/**
 * __useCreateConnectionMutation__
 *
 * To run a mutation, you first call `useCreateConnectionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateConnectionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createConnectionMutation, { data, loading, error }] = useCreateConnectionMutation({
 *   variables: {
 *      createConnectionInput: // value for 'createConnectionInput'
 *   },
 * });
 */
export function useCreateConnectionMutation(baseOptions?: Apollo.MutationHookOptions<Types.CreateConnectionMutation, Types.CreateConnectionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.CreateConnectionMutation, Types.CreateConnectionMutationVariables>(CreateConnectionDocument, options);
      }
export type CreateConnectionMutationHookResult = ReturnType<typeof useCreateConnectionMutation>;
export type CreateConnectionMutationResult = Apollo.MutationResult<Types.CreateConnectionMutation>;
export type CreateConnectionMutationOptions = Apollo.BaseMutationOptions<Types.CreateConnectionMutation, Types.CreateConnectionMutationVariables>;
export const UpdateConnectionDocument = gql`
    mutation updateConnection($id: ID!, $updateConnectionInput: UpdateConnectionDto!) {
  updateConnection(id: $id, updateConnectionInput: $updateConnectionInput) {
    _id
    name
    description
    type
    host
    port
    database
    username
    isActive
    createdAt
    updatedAt
  }
}
    `;
export type UpdateConnectionMutationFn = Apollo.MutationFunction<Types.UpdateConnectionMutation, Types.UpdateConnectionMutationVariables>;

/**
 * __useUpdateConnectionMutation__
 *
 * To run a mutation, you first call `useUpdateConnectionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateConnectionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateConnectionMutation, { data, loading, error }] = useUpdateConnectionMutation({
 *   variables: {
 *      id: // value for 'id'
 *      updateConnectionInput: // value for 'updateConnectionInput'
 *   },
 * });
 */
export function useUpdateConnectionMutation(baseOptions?: Apollo.MutationHookOptions<Types.UpdateConnectionMutation, Types.UpdateConnectionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.UpdateConnectionMutation, Types.UpdateConnectionMutationVariables>(UpdateConnectionDocument, options);
      }
export type UpdateConnectionMutationHookResult = ReturnType<typeof useUpdateConnectionMutation>;
export type UpdateConnectionMutationResult = Apollo.MutationResult<Types.UpdateConnectionMutation>;
export type UpdateConnectionMutationOptions = Apollo.BaseMutationOptions<Types.UpdateConnectionMutation, Types.UpdateConnectionMutationVariables>;
export const DeleteConnectionDocument = gql`
    mutation deleteConnection($id: ID!) {
  deleteConnection(id: $id)
}
    `;
export type DeleteConnectionMutationFn = Apollo.MutationFunction<Types.DeleteConnectionMutation, Types.DeleteConnectionMutationVariables>;

/**
 * __useDeleteConnectionMutation__
 *
 * To run a mutation, you first call `useDeleteConnectionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteConnectionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteConnectionMutation, { data, loading, error }] = useDeleteConnectionMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteConnectionMutation(baseOptions?: Apollo.MutationHookOptions<Types.DeleteConnectionMutation, Types.DeleteConnectionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.DeleteConnectionMutation, Types.DeleteConnectionMutationVariables>(DeleteConnectionDocument, options);
      }
export type DeleteConnectionMutationHookResult = ReturnType<typeof useDeleteConnectionMutation>;
export type DeleteConnectionMutationResult = Apollo.MutationResult<Types.DeleteConnectionMutation>;
export type DeleteConnectionMutationOptions = Apollo.BaseMutationOptions<Types.DeleteConnectionMutation, Types.DeleteConnectionMutationVariables>;
export const AddSqlExampleDocument = gql`
    mutation addSqlExample($question: String!, $sql: String!, $category: String, $description: String, $databaseSchema: String) {
  addSqlExample(
    question: $question
    sql: $sql
    category: $category
    description: $description
    databaseSchema: $databaseSchema
  )
}
    `;
export type AddSqlExampleMutationFn = Apollo.MutationFunction<Types.AddSqlExampleMutation, Types.AddSqlExampleMutationVariables>;

/**
 * __useAddSqlExampleMutation__
 *
 * To run a mutation, you first call `useAddSqlExampleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddSqlExampleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addSqlExampleMutation, { data, loading, error }] = useAddSqlExampleMutation({
 *   variables: {
 *      question: // value for 'question'
 *      sql: // value for 'sql'
 *      category: // value for 'category'
 *      description: // value for 'description'
 *      databaseSchema: // value for 'databaseSchema'
 *   },
 * });
 */
export function useAddSqlExampleMutation(baseOptions?: Apollo.MutationHookOptions<Types.AddSqlExampleMutation, Types.AddSqlExampleMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.AddSqlExampleMutation, Types.AddSqlExampleMutationVariables>(AddSqlExampleDocument, options);
      }
export type AddSqlExampleMutationHookResult = ReturnType<typeof useAddSqlExampleMutation>;
export type AddSqlExampleMutationResult = Apollo.MutationResult<Types.AddSqlExampleMutation>;
export type AddSqlExampleMutationOptions = Apollo.BaseMutationOptions<Types.AddSqlExampleMutation, Types.AddSqlExampleMutationVariables>;
export const ExportToExcelDocument = gql`
    mutation exportToExcel($interactionId: String!) {
  exportToExcel(interactionId: $interactionId) {
    url
  }
}
    `;
export type ExportToExcelMutationFn = Apollo.MutationFunction<Types.ExportToExcelMutation, Types.ExportToExcelMutationVariables>;

/**
 * __useExportToExcelMutation__
 *
 * To run a mutation, you first call `useExportToExcelMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useExportToExcelMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [exportToExcelMutation, { data, loading, error }] = useExportToExcelMutation({
 *   variables: {
 *      interactionId: // value for 'interactionId'
 *   },
 * });
 */
export function useExportToExcelMutation(baseOptions?: Apollo.MutationHookOptions<Types.ExportToExcelMutation, Types.ExportToExcelMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.ExportToExcelMutation, Types.ExportToExcelMutationVariables>(ExportToExcelDocument, options);
      }
export type ExportToExcelMutationHookResult = ReturnType<typeof useExportToExcelMutation>;
export type ExportToExcelMutationResult = Apollo.MutationResult<Types.ExportToExcelMutation>;
export type ExportToExcelMutationOptions = Apollo.BaseMutationOptions<Types.ExportToExcelMutation, Types.ExportToExcelMutationVariables>;
export const GetUserThreadsDocument = gql`
    query getUserThreads {
  getUserThreads {
    _id
    threadId
    topic
    connectionId
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useGetUserThreadsQuery__
 *
 * To run a query within a React component, call `useGetUserThreadsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserThreadsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserThreadsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetUserThreadsQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetUserThreadsQuery, Types.GetUserThreadsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetUserThreadsQuery, Types.GetUserThreadsQueryVariables>(GetUserThreadsDocument, options);
      }
export function useGetUserThreadsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetUserThreadsQuery, Types.GetUserThreadsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetUserThreadsQuery, Types.GetUserThreadsQueryVariables>(GetUserThreadsDocument, options);
        }
export function useGetUserThreadsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetUserThreadsQuery, Types.GetUserThreadsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetUserThreadsQuery, Types.GetUserThreadsQueryVariables>(GetUserThreadsDocument, options);
        }
export type GetUserThreadsQueryHookResult = ReturnType<typeof useGetUserThreadsQuery>;
export type GetUserThreadsLazyQueryHookResult = ReturnType<typeof useGetUserThreadsLazyQuery>;
export type GetUserThreadsSuspenseQueryHookResult = ReturnType<typeof useGetUserThreadsSuspenseQuery>;
export type GetUserThreadsQueryResult = Apollo.QueryResult<Types.GetUserThreadsQuery, Types.GetUserThreadsQueryVariables>;
export const GetThreadDocument = gql`
    query getThread($threadId: String!) {
  getThread(threadId: $threadId) {
    _id
    threadId
    locale
    timezone
    topic
    connectionId
    interactions {
      _id
      userQuery
      response
      execution_status
      execution_time_ms
      visualization {
        _id
        shouldVisualize
        reasoning
        graphs
        createdAt
        updatedAt
      }
      sqlResult {
        sql
        rows
        row_count
        status
        error_message
        execution_time_ms
      }
      messages {
        role
        content
        step
        timestamp
        metadata
        name
      }
      user_rating
      user_feedback
      feedback_timestamp
      downloadableFiles {
        filename
        url
        timestamp
      }
      createdAt
      updatedAt
    }
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useGetThreadQuery__
 *
 * To run a query within a React component, call `useGetThreadQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetThreadQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetThreadQuery({
 *   variables: {
 *      threadId: // value for 'threadId'
 *   },
 * });
 */
export function useGetThreadQuery(baseOptions: Apollo.QueryHookOptions<Types.GetThreadQuery, Types.GetThreadQueryVariables> & ({ variables: Types.GetThreadQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetThreadQuery, Types.GetThreadQueryVariables>(GetThreadDocument, options);
      }
export function useGetThreadLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetThreadQuery, Types.GetThreadQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetThreadQuery, Types.GetThreadQueryVariables>(GetThreadDocument, options);
        }
export function useGetThreadSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetThreadQuery, Types.GetThreadQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetThreadQuery, Types.GetThreadQueryVariables>(GetThreadDocument, options);
        }
export type GetThreadQueryHookResult = ReturnType<typeof useGetThreadQuery>;
export type GetThreadLazyQueryHookResult = ReturnType<typeof useGetThreadLazyQuery>;
export type GetThreadSuspenseQueryHookResult = ReturnType<typeof useGetThreadSuspenseQuery>;
export type GetThreadQueryResult = Apollo.QueryResult<Types.GetThreadQuery, Types.GetThreadQueryVariables>;
export const GetConnectionsDocument = gql`
    query getConnections {
  connections {
    _id
    name
    description
    type
    host
    port
    database
    username
    isActive
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useGetConnectionsQuery__
 *
 * To run a query within a React component, call `useGetConnectionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetConnectionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetConnectionsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetConnectionsQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetConnectionsQuery, Types.GetConnectionsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetConnectionsQuery, Types.GetConnectionsQueryVariables>(GetConnectionsDocument, options);
      }
export function useGetConnectionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetConnectionsQuery, Types.GetConnectionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetConnectionsQuery, Types.GetConnectionsQueryVariables>(GetConnectionsDocument, options);
        }
export function useGetConnectionsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetConnectionsQuery, Types.GetConnectionsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetConnectionsQuery, Types.GetConnectionsQueryVariables>(GetConnectionsDocument, options);
        }
export type GetConnectionsQueryHookResult = ReturnType<typeof useGetConnectionsQuery>;
export type GetConnectionsLazyQueryHookResult = ReturnType<typeof useGetConnectionsLazyQuery>;
export type GetConnectionsSuspenseQueryHookResult = ReturnType<typeof useGetConnectionsSuspenseQuery>;
export type GetConnectionsQueryResult = Apollo.QueryResult<Types.GetConnectionsQuery, Types.GetConnectionsQueryVariables>;
export const GetConnectionDocument = gql`
    query getConnection($id: ID!) {
  connection(id: $id) {
    _id
    name
    description
    type
    host
    port
    database
    username
    isActive
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useGetConnectionQuery__
 *
 * To run a query within a React component, call `useGetConnectionQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetConnectionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetConnectionQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetConnectionQuery(baseOptions: Apollo.QueryHookOptions<Types.GetConnectionQuery, Types.GetConnectionQueryVariables> & ({ variables: Types.GetConnectionQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetConnectionQuery, Types.GetConnectionQueryVariables>(GetConnectionDocument, options);
      }
export function useGetConnectionLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetConnectionQuery, Types.GetConnectionQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetConnectionQuery, Types.GetConnectionQueryVariables>(GetConnectionDocument, options);
        }
export function useGetConnectionSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetConnectionQuery, Types.GetConnectionQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetConnectionQuery, Types.GetConnectionQueryVariables>(GetConnectionDocument, options);
        }
export type GetConnectionQueryHookResult = ReturnType<typeof useGetConnectionQuery>;
export type GetConnectionLazyQueryHookResult = ReturnType<typeof useGetConnectionLazyQuery>;
export type GetConnectionSuspenseQueryHookResult = ReturnType<typeof useGetConnectionSuspenseQuery>;
export type GetConnectionQueryResult = Apollo.QueryResult<Types.GetConnectionQuery, Types.GetConnectionQueryVariables>;
export const TestConnectionDocument = gql`
    query testConnection($id: ID!) {
  testConnection(id: $id) {
    success
    message
    error
  }
}
    `;

/**
 * __useTestConnectionQuery__
 *
 * To run a query within a React component, call `useTestConnectionQuery` and pass it any options that fit your needs.
 * When your component renders, `useTestConnectionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTestConnectionQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useTestConnectionQuery(baseOptions: Apollo.QueryHookOptions<Types.TestConnectionQuery, Types.TestConnectionQueryVariables> & ({ variables: Types.TestConnectionQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.TestConnectionQuery, Types.TestConnectionQueryVariables>(TestConnectionDocument, options);
      }
export function useTestConnectionLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.TestConnectionQuery, Types.TestConnectionQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.TestConnectionQuery, Types.TestConnectionQueryVariables>(TestConnectionDocument, options);
        }
export function useTestConnectionSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.TestConnectionQuery, Types.TestConnectionQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.TestConnectionQuery, Types.TestConnectionQueryVariables>(TestConnectionDocument, options);
        }
export type TestConnectionQueryHookResult = ReturnType<typeof useTestConnectionQuery>;
export type TestConnectionLazyQueryHookResult = ReturnType<typeof useTestConnectionLazyQuery>;
export type TestConnectionSuspenseQueryHookResult = ReturnType<typeof useTestConnectionSuspenseQuery>;
export type TestConnectionQueryResult = Apollo.QueryResult<Types.TestConnectionQuery, Types.TestConnectionQueryVariables>;
export const GetAvailableConnectionTypesDocument = gql`
    query getAvailableConnectionTypes {
  availableConnectionTypes
}
    `;

/**
 * __useGetAvailableConnectionTypesQuery__
 *
 * To run a query within a React component, call `useGetAvailableConnectionTypesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAvailableConnectionTypesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAvailableConnectionTypesQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetAvailableConnectionTypesQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetAvailableConnectionTypesQuery, Types.GetAvailableConnectionTypesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetAvailableConnectionTypesQuery, Types.GetAvailableConnectionTypesQueryVariables>(GetAvailableConnectionTypesDocument, options);
      }
export function useGetAvailableConnectionTypesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetAvailableConnectionTypesQuery, Types.GetAvailableConnectionTypesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetAvailableConnectionTypesQuery, Types.GetAvailableConnectionTypesQueryVariables>(GetAvailableConnectionTypesDocument, options);
        }
export function useGetAvailableConnectionTypesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetAvailableConnectionTypesQuery, Types.GetAvailableConnectionTypesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetAvailableConnectionTypesQuery, Types.GetAvailableConnectionTypesQueryVariables>(GetAvailableConnectionTypesDocument, options);
        }
export type GetAvailableConnectionTypesQueryHookResult = ReturnType<typeof useGetAvailableConnectionTypesQuery>;
export type GetAvailableConnectionTypesLazyQueryHookResult = ReturnType<typeof useGetAvailableConnectionTypesLazyQuery>;
export type GetAvailableConnectionTypesSuspenseQueryHookResult = ReturnType<typeof useGetAvailableConnectionTypesSuspenseQuery>;
export type GetAvailableConnectionTypesQueryResult = Apollo.QueryResult<Types.GetAvailableConnectionTypesQuery, Types.GetAvailableConnectionTypesQueryVariables>;
export const GetAllSqlExamplesDocument = gql`
    query getAllSqlExamples {
  getAllSqlExamples {
    id
    question
    sql
    category
    description
    database_schema
    is_verified
    quality_score
    success_count
    usage_count
    created_at
  }
}
    `;

/**
 * __useGetAllSqlExamplesQuery__
 *
 * To run a query within a React component, call `useGetAllSqlExamplesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAllSqlExamplesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAllSqlExamplesQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetAllSqlExamplesQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetAllSqlExamplesQuery, Types.GetAllSqlExamplesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetAllSqlExamplesQuery, Types.GetAllSqlExamplesQueryVariables>(GetAllSqlExamplesDocument, options);
      }
export function useGetAllSqlExamplesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetAllSqlExamplesQuery, Types.GetAllSqlExamplesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetAllSqlExamplesQuery, Types.GetAllSqlExamplesQueryVariables>(GetAllSqlExamplesDocument, options);
        }
export function useGetAllSqlExamplesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetAllSqlExamplesQuery, Types.GetAllSqlExamplesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetAllSqlExamplesQuery, Types.GetAllSqlExamplesQueryVariables>(GetAllSqlExamplesDocument, options);
        }
export type GetAllSqlExamplesQueryHookResult = ReturnType<typeof useGetAllSqlExamplesQuery>;
export type GetAllSqlExamplesLazyQueryHookResult = ReturnType<typeof useGetAllSqlExamplesLazyQuery>;
export type GetAllSqlExamplesSuspenseQueryHookResult = ReturnType<typeof useGetAllSqlExamplesSuspenseQuery>;
export type GetAllSqlExamplesQueryResult = Apollo.QueryResult<Types.GetAllSqlExamplesQuery, Types.GetAllSqlExamplesQueryVariables>;
export const SearchSqlExamplesDocument = gql`
    query searchSqlExamples($query: String!, $limit: Float) {
  searchSqlExamples(query: $query, limit: $limit) {
    id
    question
    sql
    category
    description
    database_schema
    is_verified
    quality_score
    similarity_score
    success_count
    usage_count
    created_at
  }
}
    `;

/**
 * __useSearchSqlExamplesQuery__
 *
 * To run a query within a React component, call `useSearchSqlExamplesQuery` and pass it any options that fit your needs.
 * When your component renders, `useSearchSqlExamplesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSearchSqlExamplesQuery({
 *   variables: {
 *      query: // value for 'query'
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useSearchSqlExamplesQuery(baseOptions: Apollo.QueryHookOptions<Types.SearchSqlExamplesQuery, Types.SearchSqlExamplesQueryVariables> & ({ variables: Types.SearchSqlExamplesQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.SearchSqlExamplesQuery, Types.SearchSqlExamplesQueryVariables>(SearchSqlExamplesDocument, options);
      }
export function useSearchSqlExamplesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.SearchSqlExamplesQuery, Types.SearchSqlExamplesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.SearchSqlExamplesQuery, Types.SearchSqlExamplesQueryVariables>(SearchSqlExamplesDocument, options);
        }
export function useSearchSqlExamplesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.SearchSqlExamplesQuery, Types.SearchSqlExamplesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.SearchSqlExamplesQuery, Types.SearchSqlExamplesQueryVariables>(SearchSqlExamplesDocument, options);
        }
export type SearchSqlExamplesQueryHookResult = ReturnType<typeof useSearchSqlExamplesQuery>;
export type SearchSqlExamplesLazyQueryHookResult = ReturnType<typeof useSearchSqlExamplesLazyQuery>;
export type SearchSqlExamplesSuspenseQueryHookResult = ReturnType<typeof useSearchSqlExamplesSuspenseQuery>;
export type SearchSqlExamplesQueryResult = Apollo.QueryResult<Types.SearchSqlExamplesQuery, Types.SearchSqlExamplesQueryVariables>;
export const GetAvailableLlMsDocument = gql`
    query getAvailableLLMs {
  getAvailableLLMs {
    id
    name
    provider
    model
    isAvailable
  }
}
    `;

/**
 * __useGetAvailableLlMsQuery__
 *
 * To run a query within a React component, call `useGetAvailableLlMsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAvailableLlMsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAvailableLlMsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetAvailableLlMsQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetAvailableLlMsQuery, Types.GetAvailableLlMsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetAvailableLlMsQuery, Types.GetAvailableLlMsQueryVariables>(GetAvailableLlMsDocument, options);
      }
export function useGetAvailableLlMsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetAvailableLlMsQuery, Types.GetAvailableLlMsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetAvailableLlMsQuery, Types.GetAvailableLlMsQueryVariables>(GetAvailableLlMsDocument, options);
        }
export function useGetAvailableLlMsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetAvailableLlMsQuery, Types.GetAvailableLlMsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetAvailableLlMsQuery, Types.GetAvailableLlMsQueryVariables>(GetAvailableLlMsDocument, options);
        }
export type GetAvailableLlMsQueryHookResult = ReturnType<typeof useGetAvailableLlMsQuery>;
export type GetAvailableLlMsLazyQueryHookResult = ReturnType<typeof useGetAvailableLlMsLazyQuery>;
export type GetAvailableLlMsSuspenseQueryHookResult = ReturnType<typeof useGetAvailableLlMsSuspenseQuery>;
export type GetAvailableLlMsQueryResult = Apollo.QueryResult<Types.GetAvailableLlMsQuery, Types.GetAvailableLlMsQueryVariables>;
export const ThreadProgressDocument = gql`
    subscription threadProgress($threadId: String!) {
  threadProgress(threadId: $threadId) {
    threadId
    step
    message
    note
    percentage
  }
}
    `;

/**
 * __useThreadProgressSubscription__
 *
 * To run a query within a React component, call `useThreadProgressSubscription` and pass it any options that fit your needs.
 * When your component renders, `useThreadProgressSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useThreadProgressSubscription({
 *   variables: {
 *      threadId: // value for 'threadId'
 *   },
 * });
 */
export function useThreadProgressSubscription(baseOptions: Apollo.SubscriptionHookOptions<Types.ThreadProgressSubscription, Types.ThreadProgressSubscriptionVariables> & ({ variables: Types.ThreadProgressSubscriptionVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<Types.ThreadProgressSubscription, Types.ThreadProgressSubscriptionVariables>(ThreadProgressDocument, options);
      }
export type ThreadProgressSubscriptionHookResult = ReturnType<typeof useThreadProgressSubscription>;
export type ThreadProgressSubscriptionResult = Apollo.SubscriptionResult<Types.ThreadProgressSubscription>;