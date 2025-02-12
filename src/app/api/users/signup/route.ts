import { connect } from "@/dbConfig/dbConfig";
import User from '@/models/userModel'
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from 'bcryptjs';
import { sendEmail } from "@/helpers/mailer";

connect();

export const maxDuration = 60;

export async function POST(req:NextRequest){
    try {
        const reqBody = await req.json();
        const { username, email, password} = reqBody;

        // validation
        console.log(reqBody);

        const user = await User.findOne({email});

        if (user) {
            return NextResponse.json(
                {error: "User already exists!"},
                {status: 400}
            );
        }

        const salt = await bcryptjs.genSalt(16);
        const hashedPassword = await bcryptjs.hash(password, salt);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
        });

        const savedUser = await newUser.save();
        console.log(savedUser);

        // verification email
        await sendEmail({ email, emailType: "VERIFY", userId: savedUser._id });

        return NextResponse.json({
            message: "User registered successfully",
            success: true,
            savedUser,
        });

    } catch (error:any) {
        return NextResponse.json(
            {error: error.message}, 
            {status: 500}
        );
    }
}