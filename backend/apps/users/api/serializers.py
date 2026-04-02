from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ("id", "username", "email", "password", "confirm_password")
        read_only_fields = ("id",)

    def validate(self, attrs):
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})

        if User.objects.filter(username=attrs["username"]).exists():
            raise serializers.ValidationError({"username": "Username already exists."})

        email = attrs.get("email")
        if email and User.objects.filter(email=email).exists():
            raise serializers.ValidationError({"email": "Email already exists."})

        return attrs

    def create(self, validated_data):
        validated_data.pop("confirm_password")
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email")
        read_only_fields = fields
