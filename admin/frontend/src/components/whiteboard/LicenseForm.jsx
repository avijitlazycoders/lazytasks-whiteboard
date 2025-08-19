import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Group, TextInput, Grid, ScrollArea, Flex, Popover } from '@mantine/core';

import { useForm } from "@mantine/form";
import { fetchLicenseKey, licenseValidation, removeErrorMessage, removeSuccessMessage } from "./store/whiteboardSlice";
import { showNotification } from "@mantine/notifications";
import appConfig from "../../configs/app.config";
import { IconCircleCheck, IconInfoCircle } from "@tabler/icons-react";
import { Tooltip } from "recharts";
import { useDisclosure } from "@mantine/hooks";

const LicenseForm = () => {
    const dispatch = useDispatch();

    const { licenseKey, isLicenseSuccess, isLicenseError } = useSelector((state) => state.license.license);
    const [license, setLicense] = useState(licenseKey || '');
    const [isSuccess, setIsSuccess] = useState(false);
    const [isVerified, setIsVerified] = useState(isLicenseSuccess || false);
    //isNotEmpty
    const [isEmpty, setIsEmpty] = useState(true);

    const form = useForm({
        mode: 'uncontrolled',
        initialValues: {
            license_key: license || '',
        },

        validate: {
            license_key: (value) => (value.length < 1 ? 'License key is required' : null),
        },
    });
    const handleSubmit = (values) => {
        values['domain'] = appConfig.liveSiteUrl;
        dispatch(licenseValidation(values)).then((response) => {
            if (response.payload && response.payload.status && response.payload.status === 200) {
                setIsSuccess(true);
                setIsVerified(true);
                setIsEmpty(false);
                showNotification({
                    id: 'load-data',
                    loading: true,
                    title: 'License',
                    message: response.payload && response.payload.message && response.payload.message,
                    autoClose: 2000,
                    disallowClose: true,
                    color: 'green',
                });
                dispatch(removeSuccessMessage());

                //setTimeout for isSuccess to false after 2 seconds
                setTimeout(() => {
                    setIsSuccess(false);
                }, 5000);
            }
            if (response.payload && response.payload.status && response.payload.status !== 200) {
                form.setFieldError('license_key', response.payload.message);
                dispatch(removeErrorMessage());
                setIsVerified(false);
                setIsEmpty(false);
            }

        });
    };

    useEffect(() => {
        setLicense(licenseKey);
        if (licenseKey) {
            form.setFieldValue('license_key', licenseKey);
        }
    }, [licenseKey]);

    useEffect(() => {
        dispatch(fetchLicenseKey());
        setLicense(licenseKey || '');
        if (licenseKey) {
            form.setFieldValue('license_key', licenseKey);
        }
    }, []);
    //useEffect isLicenseSuccess
    useEffect(() => {
        setIsVerified(isLicenseSuccess)
        setIsEmpty(!isLicenseSuccess);
    }, [isLicenseSuccess]);

    //handleInputChange
    const handleInputChange = (event) => {
        const { value } = event.target;

        if (value.length < 1) {
            setIsEmpty(true)
            form.setFieldError('license_key', 'License key is required');
        } else {
            setIsEmpty(false)
            form.clearFieldError('license_key');
            setLicense(value);
        }
    };
    const [opened, { close, open }] = useDisclosure(false);

    return (
        <ScrollArea className="h-[calc(100vh-250px)] pb-[2px] overflow-x-" scrollbars="y">
            <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
                <Grid justify="flex-start" align="flex-start">
                    <Grid.Col span={4.5}>
                        <TextInput
                            className="w-full"
                            label={
                                <>
                                    <Group spacing={5} gap={5}>
                                        License Key
                                        <Popover width={320} position="top-start" withArrow shadow="md" opened={opened}>
                                            <Popover.Target>
                                                <IconInfoCircle onMouseEnter={open} onMouseLeave={close} size={16} />
                                            </Popover.Target>
                                            <Popover.Dropdown>
                                                Insert your License key here which you will find to your lazycoders.co site profile.
                                            </Popover.Dropdown>
                                        </Popover>
                                    </Group>
                                </>
                            }
                            placeholder="Enter your license key"
                            key={form.key('license_key')}
                            defaultValue={license || ''}
                            {...form.getInputProps('license_key')}
                            onChange={(event) => {
                                form.getInputProps('license_key').onChange(event); // Let Mantine handle form state
                                handleInputChange(event);   // Your custom logic
                            }}
                        />
                        {isSuccess &&
                            <p style={{ "color": "#39758d", "fontSize": 'var(--input-error-size, calc(var(--mantine-font-size-sm) - calc(0.125rem * var(--mantine-scale))))' }} class="!text-[10px] mantine-InputWrapper-success mantine-TextInput-success" id="mantine-89ny2ja26-success">License key verified successfully!</p>
                        }
                    </Grid.Col>
                    <Grid.Col span={3}>
                        <Button
                            leftSection={isVerified && !isEmpty && <IconCircleCheck size={18} />}
                            style={{
                                marginTop: '25px',
                                backgroundColor: isEmpty ? 'RGB(212, 217, 220)' : !isEmpty && !isVerified ? '#ED7D31' : isVerified ? '#39758d' : 'RGB(212, 217, 220)',
                            }}
                            variant="filled"
                            color="#ED7D31"
                            type="submit">
                            {isEmpty ? 'Verify' : !isEmpty && !isVerified ? 'Verify' : 'Verified'}
                        </Button>
                    </Grid.Col>
                </Grid>

            </form>
        </ScrollArea>
    );
}
export default LicenseForm;