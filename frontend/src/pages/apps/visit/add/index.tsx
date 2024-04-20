import { Avatar, Box, Button, Card, CardContent, CardHeader, Grid } from '@mui/material';
import React, { Fragment, useContext, useEffect, useState } from 'react';

import { AbilityContext } from '@/layouts/components/acl/Can';
import { Icon } from '@iconify/react';
import { LocalStorageService } from '@/services/localStorageService';
import RenderAvatar from '@/@core/components/avatar';
import { isEmpty } from '@/@core/utils/utils';
import { useAuth } from '@/hooks/useAuth';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import { yupResolver } from '@hookform/resolvers/yup';
import SurveyForm from '@/@core/components/visit/SurveyForm';
import SurveyList from '@/@core/components/visit/SurveyList';
import { defaultValues, schema, surveyList } from '@/views/apps/visit/survey-list';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const CreateVisit = () => {
  // const { teams, about, contacts, overview } = props;

  const router = useRouter();
  const auth = useAuth();
  const useLocal = useLocalStorage();
  const storedToken = useLocal.getToken()!;

  const ability = useContext(AbilityContext);
  const [student, setStudent] = useState<any>(null);
  const [survey, setSurvey] = useState<any>(surveyList);

  useEffect(() => {
    const redirectToVisitList = () => {
      router.push('/apps/visit/list');
    };

    if (!router.query.data) {
      redirectToVisitList();
      return;
    }

    const studentData = JSON.parse(router.query.data as string);
    setStudent(studentData);

    return () => {
      setStudent(null);
    };
  }, [router.query, router]);

  const formatAddress = (info: any) => {
    if (!info) return 'ไม่มีข้อมูล';

    const { addressLine1, subdistrict, district, province, postalCode } = info?.account || {};
    const address =
      isEmpty(addressLine1) && isEmpty(subdistrict) && isEmpty(district) && isEmpty(province) && isEmpty(postalCode)
        ? 'ไม่มีข้อมูล'
        : `${addressLine1} ตำบล ${subdistrict} อำเภอ ${district} จังหวัด ${province} ${postalCode}`;
    return address;
  };

  const about = [
    {
      icon: 'icon-park-outline:people',
      value: `${student?.account?.title}${student?.account?.firstName} ${student?.account?.lastName} ชั้น ${student?.defaultClassroom?.name}`,
      property: 'ชื่อ - สกุล',
      key: 'label',
      color: 'primary',
    },
    {
      icon: 'ph:address-book-bold',
      value: formatAddress(student),
      property: 'ที่อยู่',
      color: 'primary',
    },
  ];

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: defaultValues,
    mode: 'onChange',
    resolver: yupResolver(schema) as any,
  });

  const onSubmit = async (data: any, e: any) => {
    e.preventDefault();
    console.log('🚀 ~ file: index.tsx:82 ~ onSubmit ~ data:', data);
  };

  console.log('🚀 ~ CreateVisit ~ errors:', errors);

  
  return (
    ability?.can('create', 'create-visit-student-page') &&
    (auth?.user?.role as string) !== 'Admin' && (
      <Fragment>
        <Button
          variant='contained'
          onClick={() => router.back()}
          startIcon={<Icon icon='mdi:arrow-left' width={24} height={24} />}
          sx={{
            mb: 5,
          }}
        >
          ย้อนกลับ
        </Button>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <CardHeader
                avatar={
                  <Avatar sx={{ color: 'primary.main' }} aria-label='create-visit'>
                    <Icon icon='mdi:home-switch-outline' width={24} height={24} />
                  </Avatar>
                }
                sx={{
                  color: 'text.primary',
                  pb: 2,
                }}
                title={`สร้างบันทึกการเยี่ยมบ้านนักเรียน`}
                subheader={`ครั้งที่ 2  ภาคเรียนที่ 2 ปีการศึกษา 2565`}
              />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid
                    item
                    xs={12}
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    {student && (
                      <RenderAvatar
                        row={student?.account}
                        storedToken={storedToken}
                        customStyle={{
                          width: 150,
                          height: 150,
                          mb: 10,
                        }}
                      />
                    )}
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ mb: 6 }}>{<SurveyList list={about as any} />}</Box>
                  </Grid>
                  <Grid item xs={12}>
                    <form noValidate onSubmit={handleSubmit(onSubmit)}>
                      <Fragment>
                        <Box sx={{ mb: 6 }}>{survey && <SurveyForm control={control} list={survey} errors={errors}/>}</Box>
                      </Fragment>
                      <Button fullWidth size='large' type='submit' variant='contained' sx={{ mb: 7 }}>
                        บันทึกข้อมูล
                      </Button>
                    </form>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Fragment>
    )
  );
};

CreateVisit.acl = {
  action: 'create',
  subject: 'create-visit-student-page',
};

export default CreateVisit;
