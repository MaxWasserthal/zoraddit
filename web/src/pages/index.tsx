import { Flex, Link, Stack } from "@chakra-ui/layout";
import { withUrqlClient } from "next-urql"
import { Layout } from "../components/Layout";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import NextLink from 'next/link';
import React from "react";
import { Box, Button, Heading, IconButton, Text } from "@chakra-ui/react";
import { useState } from "react";
import { UpvoteSection } from "../components/UpvoteSection";
import { EditDeletePostButtons } from "../components/EditDeletePostButtons";

const Index = () => {
  const [variables, setVariables] = useState({limit: 10, cursor: null as null | string});

  const [{data, fetching}] = usePostsQuery({
    variables
  });

  if(!fetching && !data) {
    return (
      <Layout>
        <div>nothin to see</div>
      </Layout>
    )}

  return (
    <Layout>
      {fetching && !data ? <div>loading...</div> : (
        <Stack spacing={8}>
          {data!.posts.posts.map((p) => 
          !p ? null : (
          <Flex key={p.id} p={5} shadow="md" borderWidth="1px">
            <UpvoteSection post={p}/>
            <Box flex={1}>
              <NextLink href="/post/[id]" as={`/post/${p.id}`}>
                <Link>
                  <Heading fontSize="xl">{p.title}</Heading>
                </Link>
              </NextLink>
              <Text>by {p.creator.username}</Text>
              <Flex align="center">
                <Text flex={1} mt={4}>{p.textSnippet}</Text>
                <Box ml="auto">
                  <EditDeletePostButtons id={p.id} creatorId={p.creator.id} />
                </Box>
              </Flex>
            </Box>
          </Flex>
          ))}
        </Stack>
      )}
      {data && data.posts.hasMore ? (<Flex>
        <Button onClick={() => {
          setVariables({
            limit: variables.limit,
            cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
          })
        }} m="auto" my={8} isLoading={fetching}>Load more</Button>
      </Flex>) : null}
    </Layout>
  )
  }

export default withUrqlClient(createUrqlClient)(Index);