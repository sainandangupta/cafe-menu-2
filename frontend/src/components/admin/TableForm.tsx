import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, InputNumber, Button, Space } from 'antd';
import { TableSchema, TableInput } from '../../utils/validators';

interface TableFormProps {
  onSubmit: (data: TableInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const TableForm: React.FC<TableFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const {
    control,
    handleSubmit,
    formState,
  } = useForm<any>({
    resolver: zodResolver(TableSchema),
    defaultValues: {
      table_number: undefined,
    },
  });
  const errors = formState.errors as any;

  const onFormSubmit = (data: any) => {
    onSubmit(data);
  };

  return (
    <Form layout="vertical" onFinish={handleSubmit(onFormSubmit)} className="py-2">
      <Form.Item
        label="Table Number"
        validateStatus={errors.table_number ? 'error' : ''}
        help={errors.table_number?.message}
        required
      >
        <Controller
          name="table_number"
          control={control}
          render={({ field: { value, onChange, ...rest } }) => (
            <InputNumber
              className="w-full"
              placeholder="e.g. 5"
              min={1}
              value={value}
              onChange={onChange}
              {...rest}
            />
          )}
        />
      </Form.Item>

      <div className="flex justify-end pt-4 border-t border-gray-100">
        <Space>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={isLoading} className="bg-emerald-700 hover:bg-emerald-800">
            Create Table
          </Button>
        </Space>
      </div>
    </Form>
  );
};

export default TableForm;
