import { PrismaClient } from '@prisma/client';
import * as xlsx from 'xlsx';
import * as path from 'path';
import * as dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 定义Excel行数据的接口
interface StudentRow {
  '学号/工号': string | number;
  姓名: string;
  班级: string;
  [key: string]: any;
}

const prisma = new PrismaClient();

async function importUsers() {
  try {
    console.log('开始导入用户数据...');

    const filePath = path.resolve(__dirname, './students.xlsx');
    const workbook = xlsx.readFile(filePath);

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const data = xlsx.utils.sheet_to_json(worksheet) as StudentRow[];

    console.log(`读取到 ${data.length} 条用户记录`);

    let successCount = 0;
    let errorCount = 0;

    for (const row of data) {
      try {
        const username = row['学号/工号']?.toString();
        const trueName = row['姓名']?.toString();
        const dept = row['班级']?.toString();

        if (!username) {
          console.error('跳过记录: 缺少学号/工号');
          errorCount++;
          continue;
        }

        const existingUser = await prisma.user.findUnique({
          where: { username },
        });

        if (existingUser) {
          console.log(`用户 ${username} 已存在，跳过`);
          continue;
        }

        await prisma.user.create({
          data: {
            username,
            trueName: trueName || null,
            dept: dept || null,
            password: '123456',
            regtime: new Date(),
            role: 1,
          },
        });

        successCount++;
        console.log(`成功导入用户: ${username} - ${trueName}`);
      } catch (err) {
        console.error(`导入用户失败:`, row, err);
        errorCount++;
      }
    }

    console.log(`导入完成! 成功: ${successCount}, 失败: ${errorCount}`);
  } catch (err) {
    console.error('导入过程中发生错误:', err);
  } finally {
    await prisma.$disconnect();
  }
}

importUsers()
  .then(() => console.log('导入脚本执行完毕'))
  .catch((e) => console.error('导入脚本执行失败:', e));
