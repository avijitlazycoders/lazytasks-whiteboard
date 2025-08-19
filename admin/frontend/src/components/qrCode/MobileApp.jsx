import React, {useEffect} from "react";
import {Button, Popover, TextInput, Image, Flex, Box, Text, Grid} from "@mantine/core";
import {useDispatch, useSelector} from "react-redux";
import {fetchQRCode} from "./store/qrCodeSlice";
export function MobileApp() {

    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(fetchQRCode());
    }, [dispatch]);

    const {qrCode} = useSelector((state) => state.qrcode.qrcode);

    return (
      <Popover width={`50%`} trapFocus position="bottom-end" withArrow shadow="md">
          <Popover.Target>
              <Button
                  style={{ height: '34px' }}
                  size="lg"
                  className={`font-semibold`}
                  variant="filled"
                  color="#39758D">Mobile App</Button>
          </Popover.Target>
          <Popover.Dropdown>
              <Grid justify="space-between" align="stretch">
                  <Grid.Col span={9}>
                      <Text size="md">Direction here</Text>
                  </Grid.Col>
                  <Grid.Col span={3}>
                      { qrCode &&
                          <Image
                              radius="md"
                              h={`auto`}
                              w="auto"
                              src={qrCode.path}
                          />
                      }
                  </Grid.Col>
              </Grid>
          </Popover.Dropdown>
      </Popover>
  );
}