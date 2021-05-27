import { Box, Flex, Heading, Link } from '@chakra-ui/layout';
import React from 'react';
import NextLink from 'next/link';
import { useLogoutMutation, useMeQuery } from '../generated/graphql';
import { Button } from '@chakra-ui/button';
import { useRouter } from 'next/router';

interface NavBarProps {

}

export const NavBar: React.FC<NavBarProps> = ({}) => {
    const router = useRouter();
    const [{fetching: logoutFetching},logout] = useLogoutMutation();
    const [{data, fetching}] = useMeQuery();
    let body = null;

    if(fetching) {

    } else if(!data?.me) {
        body = (
            <>
                <NextLink href="/login">
                    <Link mr={2} >Login</Link>
                </NextLink>
                <NextLink href="register">
                    <Link>Register</Link>
                </NextLink>
            </>
        )
    } else {
        body = (
            <Flex align="center">
                <NextLink href="/create-post">
                    <Button as={Link} mr={2} alignSelf="center">create post</Button>
                </NextLink>
                <Box m={3}>{data.me.username}</Box>
                <Button onClick={async () => {
                    await logout();
                    router.reload();
                }}
                isLoading={logoutFetching} variant="link">Logout</Button>
            </Flex>
        )
    }
    return (
        <Flex zIndex={1} position="sticky" top={0} bg="teal" p={4} >
            <Flex m="auto" flex={1} align="center" maxW={800}>
                <NextLink href="/">
                    <Link>
                        <Heading>zoRaddit</Heading>
                    </Link>
                </NextLink>
                <Box ml={'auto'}>
                    {body}
                </Box>
            </Flex>
        </Flex>
    );
}